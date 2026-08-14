import { getDb } from "@/lib/db"
import {
  profileBaselines,
  postMetricsHistory,
  overallAnalytics,
  scheduledPosts,
  linkedinProfiles,
} from "@noticias/database"
import { eq, and, desc, lt, asc, gte } from "drizzle-orm"

export const SNAPSHOT_DAYS = [1, 3, 7, 14, 30]

interface MetricsSnapshot {
  impressions: number
  likes: number
  comments: number
  shares: number
  source: string
  raw?: unknown
}

export async function getLinkedInProfileById(profileId: number) {
  const db = getDb()
  const [profile] = await db
    .select()
    .from(linkedinProfiles)
    .where(eq(linkedinProfiles.id, profileId))
    .limit(1)
  return profile || null
}

// ---------------------------------------------------------------------------
// Baseline (snapshot de bienvenida)
// ---------------------------------------------------------------------------

async function fetchNetworkSizeFromLinkedIn(profile: any) {
  const isOrganization =
    profile.profileType === "company" || profile.profileType === "organization"
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    let url: string
    if (isOrganization) {
      // Página de empresa: follower count via Organization Network Size API
      url = `https://api.linkedin.com/v2/networkSizes/urn:li:organization:${profile.linkedinId}?edgeType=COMPANY_FOLLOWED_BY_MEMBER`
    } else {
      // Perfil personal: Connections Size API (reemplaza networkSizes deprecado)
      url = `https://api.linkedin.com/v2/connections/urn:li:person:${profile.linkedinId}`
    }
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${profile.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!resp.ok) return null
    const data = await resp.json()
    return {
      connections: !isOrganization ? (data.firstDegreeSize ?? 0) : undefined,
      followers: isOrganization ? (data.firstDegreeSize ?? 0) : undefined,
    }
  } catch (e) {
    console.error("[analytics] network size fetch fallo:", e)
    return null
  }
}

export async function captureProfileBaseline(
  profileId: number,
  manual?: {
    followers?: number
    connections?: number
    profileViews?: number
    reach?: number
  },
) {
  const db = getDb()
  const profile = await getLinkedInProfileById(profileId)
  if (!profile) throw new Error("LinkedIn profile not found")

  const existing = await getProfileBaseline(profileId)

  let source = "manual"
  let followers = manual?.followers ?? existing?.initialFollowersCount ?? 0
  let connections = manual?.connections ?? existing?.initialConnectionsCount ?? 0
  let profileViews = manual?.profileViews ?? existing?.initialProfileViews ?? 0
  let reach = manual?.reach ?? existing?.reachBaseline ?? 0

  const api = await fetchNetworkSizeFromLinkedIn(profile)
  if (api) {
    source = "api"
    if (api.followers !== undefined) {
      followers = manual?.followers ?? api.followers
    }
    if (api.connections !== undefined) {
      connections = manual?.connections ?? api.connections
    }
  }

  const [row] = await db
    .insert(profileBaselines)
    .values({
      userId: profile.userId,
      linkedinProfileId: profileId,
      initialFollowersCount: followers,
      initialConnectionsCount: connections,
      initialProfileViews: profileViews,
      reachBaseline: reach,
      source,
      snapshotDate: new Date(),
    })
    .onConflictDoUpdate({
      target: profileBaselines.linkedinProfileId,
      set: {
        initialFollowersCount: followers,
        initialConnectionsCount: connections,
        initialProfileViews: profileViews,
        reachBaseline: reach,
        source,
        snapshotDate: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning()

  return row
}

export async function getProfileBaseline(profileId: number) {
  const db = getDb()
  const [row] = await db
    .select()
    .from(profileBaselines)
    .where(eq(profileBaselines.linkedinProfileId, profileId))
    .limit(1)
  return row || null
}

// ---------------------------------------------------------------------------
// Métricas por publicación
// ---------------------------------------------------------------------------

export async function fetchPostMetricsFromLinkedIn(
  profileId: number,
  linkedinPostId: string,
): Promise<MetricsSnapshot | null> {
  const profile = await getLinkedInProfileById(profileId)
  if (!profile || !linkedinPostId) return null

  const shareId = linkedinPostId.includes(":")
    ? linkedinPostId.split(":").pop()
    : linkedinPostId
  if (!shareId) return null

  const isOrganization = profile.profileType === "company" || profile.profileType === "organization"

  // Páginas de empresa: estadísticas oficiales
  if (isOrganization) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const orgUrn = `urn:li:organization:${profile.linkedinId}`
      const resp = await fetch(
        `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${orgUrn}&shares=List(${linkedinPostId})`,
        {
          headers: {
            Authorization: `Bearer ${profile.accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
          signal: controller.signal,
        },
      )
      clearTimeout(timeout)
      if (!resp.ok) return null
      const data = await resp.json()
      const element = data?.elements?.[0]
      const stats = element?.totalShareStatistics || element?.shareStatistics || null
      if (!stats) return null
      return {
        impressions: stats.impressionCount ?? 0,
        likes: stats.likeCount ?? 0,
        comments: stats.commentCount ?? 0,
        shares: stats.shareCount ?? 0,
        source: "api",
        raw: data,
      }
    } catch (e) {
      console.error("[analytics] organizationalEntityShareStatistics fallo:", e)
      return null
    }
  }

  // Perfiles personales: sin endpoint público de analytics (requiere partnership).
  // Mejor esfuerzo vía UGC API.
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const resp = await fetch(
      `https://api.linkedin.com/v2/ugcPosts/${linkedinPostId}?projection=(id,totalShareStatistics)`,
      {
        headers: {
          Authorization: `Bearer ${profile.accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        signal: controller.signal,
      },
    )
    clearTimeout(timeout)
    if (!resp.ok) return null
    const data = await resp.json()
    const stats = data?.totalShareStatistics
    if (!stats) return null
    return {
      impressions: stats.impressionCount ?? 0,
      likes: stats.likeCount ?? 0,
      comments: stats.commentCount ?? 0,
      shares: stats.shareCount ?? 0,
      source: "api",
      raw: data,
    }
  } catch (e) {
    console.error("[analytics] ugcPosts metrics fallo:", e)
    return null
  }
}

export async function recordPostMetricsSnapshot(input: {
  scheduledPostId: number
  userId: string
  profileId?: number | null
  linkedinPostId?: string | null
  snapshotDay: number
  metrics: MetricsSnapshot
}) {
  const db = getDb()
  const impressions = Math.max(0, input.metrics.impressions || 0)
  const likes = Math.max(0, input.metrics.likes || 0)
  const comments = Math.max(0, input.metrics.comments || 0)
  const shares = Math.max(0, input.metrics.shares || 0)
  const engagementRate = impressions > 0 ? ((likes + comments + shares) / impressions) * 100 : 0

  const [row] = await db
    .insert(postMetricsHistory)
    .values({
      scheduledPostId: input.scheduledPostId,
      userId: input.userId,
      linkedinProfileId: input.profileId as number,
      linkedinPostId: input.linkedinPostId ?? null,
      snapshotDay: input.snapshotDay,
      metricsDate: new Date(),
      impressionCount: impressions,
      likeCount: likes,
      commentCount: comments,
      shareCount: shares,
      engagementRate: Math.round(engagementRate * 100) / 100,
      source: input.metrics.source,
      rawPayload: input.metrics.raw ? JSON.parse(JSON.stringify(input.metrics.raw)) : null,
    })
    .onConflictDoUpdate({
      target: [postMetricsHistory.scheduledPostId, postMetricsHistory.snapshotDay],
      set: {
        metricsDate: new Date(),
        impressionCount: impressions,
        likeCount: likes,
        commentCount: comments,
        shareCount: shares,
        engagementRate: Math.round(engagementRate * 100) / 100,
        source: input.metrics.source,
        rawPayload: input.metrics.raw ? JSON.parse(JSON.stringify(input.metrics.raw)) : null,
        updatedAt: new Date(),
      },
    })
    .returning()

  return row
}

export async function getPostMetrics(postId: number) {
  const db = getDb()
  return db
    .select()
    .from(postMetricsHistory)
    .where(eq(postMetricsHistory.scheduledPostId, postId))
    .orderBy(asc(postMetricsHistory.snapshotDay))
}

export async function getLatestPostMetrics(postId: number) {
  const db = getDb()
  const [row] = await db
    .select()
    .from(postMetricsHistory)
    .where(eq(postMetricsHistory.scheduledPostId, postId))
    .orderBy(desc(postMetricsHistory.snapshotDay))
    .limit(1)
  return row || null
}

export function getDueSnapshotDays(postedAt: Date, recordedDays: number[]) {
  const now = Date.now()
  const daysElapsed = Math.floor((now - postedAt.getTime()) / 86400000)
  return SNAPSHOT_DAYS.filter((day) => daysElapsed >= day && !recordedDays.includes(day))
}

export async function refreshPostMetrics(postId: number) {
  const db = getDb()
  const [post] = await db
    .select()
    .from(scheduledPosts)
    .where(and(eq(scheduledPosts.id, postId), eq(scheduledPosts.status, "published")))
    .limit(1)
  if (!post || !post.postedAt || !post.linkedinPostId) {
    return { postId, refreshed: false, reason: "not-published-or-no-urn" }
  }

  const recorded = (await getPostMetrics(postId)).map((m) => m.snapshotDay ?? 0)
  const due = getDueSnapshotDays(post.postedAt, recorded)
  if (due.length === 0) {
    return { postId, refreshed: false, reason: "no-due-snapshot" }
  }

  const metrics = await fetchPostMetricsFromLinkedIn(
    post.linkedinProfileId ?? post.profileId,
    post.linkedinPostId,
  )

  if (!metrics) {
    // Registrar marcador "no disponible" para evitar reintentos repetidos del mismo día
    await recordPostMetricsSnapshot({
      scheduledPostId: postId,
      userId: post.userId!,
      profileId: (post.linkedinProfileId ?? post.profileId) as number,
      linkedinPostId: post.linkedinPostId,
      snapshotDay: Math.max(...due),
      metrics: { impressions: 0, likes: 0, comments: 0, shares: 0, source: "unavailable" },
    })
    return { postId, refreshed: false, reason: "api-unavailable", snapshotDay: Math.max(...due) }
  }

  let saved: any[] = []
  for (const day of due) {
    const row = await recordPostMetricsSnapshot({
      scheduledPostId: postId,
      userId: post.userId!,
      profileId: (post.linkedinProfileId ?? post.profileId) as number,
      linkedinPostId: post.linkedinPostId,
      snapshotDay: day,
      metrics,
    })
    saved.push(row)
  }
  return { postId, refreshed: true, snapshotDays: due, snapshots: saved }
}

// ---------------------------------------------------------------------------
// Métricas acumuladas (impacto global)
// ---------------------------------------------------------------------------

export function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setHours(0, 0, 0, 0)
  return new Date(d.setDate(diff))
}

export async function computeOverallAnalytics(userId: string, profileId: number) {
  const db = getDb()
  const baseline = await getProfileBaseline(profileId)

  const posts = await db
    .select()
    .from(scheduledPosts)
    .where(
      and(
        eq(scheduledPosts.userId, userId),
        eq(scheduledPosts.linkedinProfileId, profileId),
        eq(scheduledPosts.status, "published"),
      ),
    )

  const perPost = []
  let totalImpressions = 0
  let totalReactions = 0
  let totalComments = 0
  let totalShares = 0

  for (const post of posts) {
    const latest = await getLatestPostMetrics(post.id)
    const impressions = latest?.impressionCount ?? 0
    const likes = latest?.likeCount ?? 0
    const comments = latest?.commentCount ?? 0
    const shares = latest?.shareCount ?? 0
    totalImpressions += impressions
    totalReactions += likes
    totalComments += comments
    totalShares += shares
    perPost.push({ postId: post.id, impressions, likes, comments, shares, engagementRate: latest?.engagementRate ?? 0 })
  }

  const weekStart = startOfWeek(new Date())
  const currentNetwork = await fetchNetworkSizeFromLinkedIn(
    (await getLinkedInProfileById(profileId)) as any,
  )
  const currentFollowers = currentNetwork?.followers ?? baseline?.initialFollowersCount ?? 0
  const netFollowerGain = currentFollowers - (baseline?.initialFollowersCount ?? 0)

  const [row] = await db
    .insert(overallAnalytics)
    .values({
      userId,
      linkedinProfileId: profileId,
      weekStart,
      followersCount: currentFollowers,
      connectionsCount: currentNetwork?.connections ?? baseline?.initialConnectionsCount ?? 0,
      totalImpressions,
      totalReactions,
      totalComments,
      totalShares,
      totalPosts: posts.length,
      netFollowerGain,
    })
    .onConflictDoUpdate({
      target: [overallAnalytics.userId, overallAnalytics.linkedinProfileId, overallAnalytics.weekStart],
      set: {
        followersCount: currentFollowers,
        connectionsCount: currentNetwork?.connections ?? baseline?.initialConnectionsCount ?? 0,
        totalImpressions,
        totalReactions,
        totalComments,
        totalShares,
        totalPosts: posts.length,
        netFollowerGain,
        updatedAt: new Date(),
      },
    })
    .returning()

  return { row, totalImpressions, totalReactions, totalComments, totalShares, totalPosts: posts.length }
}

// ---------------------------------------------------------------------------
// Dashboard agregado
// ---------------------------------------------------------------------------

export async function getAnalyticsDashboard(userId: string) {
  const db = getDb()
  const profiles = await db
    .select()
    .from(linkedinProfiles)
    .where(and(eq(linkedinProfiles.userId, userId), eq(linkedinProfiles.isActive, true)))

  const results = []

  for (const profile of profiles) {
    const baseline = await getProfileBaseline(profile.id)

    const posts = await db
      .select()
      .from(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.userId, userId),
          eq(scheduledPosts.linkedinProfileId, profile.id),
          eq(scheduledPosts.status, "published"),
        ),
      )
      .orderBy(desc(scheduledPosts.postedAt))

    const postDetails = []
    let totalImpressions = 0
    let totalReactions = 0
    let totalComments = 0
    let totalShares = 0

    for (const post of posts) {
      const metrics = await getPostMetrics(post.id)
      const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null
      const impressions = latest?.impressionCount ?? 0
      const likes = latest?.likeCount ?? 0
      const comments = latest?.commentCount ?? 0
      const shares = latest?.shareCount ?? 0
      totalImpressions += impressions
      totalReactions += likes
      totalComments += comments
      totalShares += shares

      postDetails.push({
        id: post.id,
        title: post.title,
        content: post.content || post.postContent,
        imageUrl: post.imageUrl,
        postedAt: post.postedAt,
        linkedinPostId: post.linkedinPostId,
        metrics,
        latest: latest
          ? {
              impressions,
              likes,
              comments,
              shares,
              engagementRate: latest.engagementRate,
              source: latest.source,
              metricsDate: latest.metricsDate,
            }
          : null,
      })
    }

    const currentNetwork = await fetchNetworkSizeFromLinkedIn(profile as any)
    const currentFollowers = currentNetwork?.followers ?? baseline?.initialFollowersCount ?? 0
    const netFollowerGain = currentFollowers - (baseline?.initialFollowersCount ?? 0)

    // Tendencia semanal desde la conexión
    const weeks = await db
      .select()
      .from(overallAnalytics)
      .where(
        and(
          eq(overallAnalytics.userId, userId),
          eq(overallAnalytics.linkedinProfileId, profile.id),
        ),
      )
      .orderBy(asc(overallAnalytics.weekStart))

    const trend = weeks.map((w) => ({
      weekStart: w.weekStart,
      impressions: w.totalImpressions,
      reactions: w.totalReactions,
      comments: w.totalComments,
      posts: w.totalPosts,
    }))

    results.push({
      profile: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profilePictureUrl: profile.profilePictureUrl,
        linkedinId: profile.linkedinId,
      },
      baseline,
      currentFollowers,
      netFollowerGain,
      totals: {
        impressions: totalImpressions,
        reactions: totalReactions,
        comments: totalComments,
        shares: totalShares,
        posts: posts.length,
      },
      posts: postDetails,
      trend,
    })
  }

  return results
}

// ---------------------------------------------------------------------------
// Worker / cron
// ---------------------------------------------------------------------------

export async function refreshAllDueMetrics() {
  const db = getDb()
  const published = await db
    .select()
    .from(scheduledPosts)
    .where(eq(scheduledPosts.status, "published"))

  const results: any[] = []
  for (const post of published) {
    try {
      const result = await refreshPostMetrics(post.id)
      results.push(result)
    } catch (e: any) {
      console.error(`[analytics] refresh post ${post.id} fallo:`, e)
      results.push({ postId: post.id, refreshed: false, error: e.message })
    }
  }

  // Snapshots semanales de perfil
  for (const profile of await db.select().from(linkedinProfiles)) {
    try {
      await computeOverallAnalytics(profile.userId, profile.id)
    } catch (e: any) {
      console.error(`[analytics] overall weekly para profile ${profile.id} fallo:`, e)
    }
  }

  return results
}
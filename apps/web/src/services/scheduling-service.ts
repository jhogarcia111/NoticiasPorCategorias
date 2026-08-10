import { getDb } from "@/lib/db"
import { schedulingConfigs, scheduledPosts } from "@noticias/database"
import { eq, and, gte, lte, asc } from "drizzle-orm"
import { postToLinkedIn, uploadImageToLinkedIn } from "@/services/linkedin-service"

export async function getSchedulingConfigs(userId: string) {
  const db = getDb()
  return db
    .select()
    .from(schedulingConfigs)
    .where(eq(schedulingConfigs.userId, userId))
    .orderBy(asc(schedulingConfigs.createdAt))
}

export async function saveSchedulingConfig(userId: string, linkedinProfileId: number, config: any) {
  const db = getDb()
  const [saved] = await db
    .insert(schedulingConfigs)
    .values({
      userId,
      linkedinProfileId,
      ...config,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [schedulingConfigs.userId, schedulingConfigs.linkedinProfileId],
      set: { ...config, updatedAt: new Date() },
    })
    .returning()

  return saved
}

export async function getScheduledPosts(userId: string, filters: any = {}) {
  const db = getDb()
  const conditions = [eq(scheduledPosts.userId, userId)]

  if (filters.status) conditions.push(eq(scheduledPosts.status, filters.status))
  if (filters.linkedinProfileId)
    conditions.push(eq(scheduledPosts.linkedinProfileId, filters.linkedinProfileId))
  if (filters.dateFrom) conditions.push(gte(scheduledPosts.scheduledAt, filters.dateFrom))
  if (filters.dateTo) conditions.push(lte(scheduledPosts.scheduledAt, filters.dateTo))

  return db
    .select()
    .from(scheduledPosts)
    .where(and(...conditions))
    .orderBy(asc(scheduledPosts.scheduledAt))
}

export async function schedulePost(userId: string, postData: any) {
  const db = getDb()
  const linkedinProfileId = postData.linkedinProfileId
  const scheduledAt = postData.scheduledAt ? new Date(postData.scheduledAt) : new Date()
  const [post] = await db
    .insert(scheduledPosts)
    .values({
      userId,
      profileId: postData.profileId ?? linkedinProfileId,
      linkedinProfileId,
      scheduledTime: scheduledAt,
      timezone: postData.timezone || "America/Bogota",
      ...postData,
      scheduledAt,
    })
    .returning()

  return post
}

export async function updateScheduledPost(postId: number, updates: any) {
  const db = getDb()
  const [updated] = await db
    .update(scheduledPosts)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(scheduledPosts.id, postId))
    .returning()

  return updated
}

export async function cancelScheduledPost(postId: number) {
  return updateScheduledPost(postId, { status: "cancelled" })
}

export async function deleteScheduledPost(postId: number) {
  const db = getDb()
  await db.delete(scheduledPosts).where(eq(scheduledPosts.id, postId))
}

export async function publishDueScheduledPosts(profileId?: number, maxPosts = 20) {
  const db = getDb()
  const dueCondition = lte(scheduledPosts.scheduledAt, new Date())
  const conditions = [eq(scheduledPosts.status, "scheduled"), dueCondition]
  if (profileId) conditions.push(eq(scheduledPosts.linkedinProfileId, profileId))

  const duePosts = await db
    .select()
    .from(scheduledPosts)
    .where(and(...conditions))
    .orderBy(asc(scheduledPosts.scheduledAt))
    .limit(maxPosts)

  return publishPosts(duePosts)
}

export async function publishScheduledPostById(postId: number) {
  const db = getDb()
  const [post] = await db
    .select()
    .from(scheduledPosts)
    .where(and(eq(scheduledPosts.id, postId), eq(scheduledPosts.status, "scheduled")))
    .limit(1)
  if (!post) throw new Error("Post programado no encontrado")
  const results = await publishPosts([post])
  return results[0]
}

async function publishPosts(posts: any[]) {
  const results: any[] = []
  for (const post of posts) {
    try {
      const pid = post.linkedinProfileId ?? post.profileId
      let imageUrn: string | null = null
      if (post.imageUrl) {
        // imageUrl puede ser base64 (datos guardados) o url
        if (post.imageUrl.startsWith("data:image")) {
          const [meta, b64] = post.imageUrl.split(",")
          const mime = meta.match(/data:(.*?);/)?.[1] || "image/jpeg"
          imageUrn = await uploadImageToLinkedIn(pid, b64, true, mime)
        } else {
          imageUrn = await uploadImageToLinkedIn(pid, post.imageUrl)
        }
      }

      const result = await postToLinkedIn(pid, post.content || post.postContent || "", post.title || undefined, undefined, imageUrn ?? undefined)

      await updateScheduledPost(post.id, {
        status: "published",
        postedAt: new Date(),
        linkedinPostId: String(result?.id || result || ""),
        errorMessage: null,
      })
      results.push({ id: post.id, status: "published" })
    } catch (error: any) {
      await updateScheduledPost(post.id, { status: "failed", errorMessage: error.message })
      results.push({ id: post.id, status: "failed", error: error.message })
    }
  }
  return results
}

export async function scheduleMultiplePosts(
  userId: string,
  linkedinProfileId: number,
  newsItems: any[],
  config: any
) {
  const posts = []
  for (const item of newsItems) {
    const dates = calculateSchedulingDates(config, 1)
    if (dates.length > 0) {
      const [post] = await getDb()
        .insert(scheduledPosts)
        .values({
          profileId: linkedinProfileId,
          linkedinProfileId,
          userId,
          title: item.title,
          content: item.content || item.summary,
          summary: item.summary,
          scheduledTime: dates[0],
          timezone: config.timezone || "America/Bogota",
          status: "scheduled",
        })
        .returning()
      posts.push(post)
    }
  }
  return posts
}

export function calculateSchedulingDates(config: any, postCount: number) {
  const dates: Date[] = []
  const now = new Date()
  let currentDate = new Date(now)

  for (let i = 0; i < postCount; i++) {
    let dayConfig = getDayConfig(config, currentDate.getDay())

    while (!dayConfig.enabled || dayConfig.postsCount === 0) {
      currentDate.setDate(currentDate.getDate() + 1)
      dayConfig = getDayConfig(config, currentDate.getDay())
    }

    const [startH, startM] = dayConfig.startTime.split(":").map(Number)
    const [endH, endM] = dayConfig.endTime.split(":").map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const interval = Math.floor((endMinutes - startMinutes) / dayConfig.postsCount)
    const postMinutes = startMinutes + (i % dayConfig.postsCount) * interval

    const scheduledDate = new Date(currentDate)
    scheduledDate.setHours(Math.floor(postMinutes / 60), postMinutes % 60, 0, 0)
    dates.push(scheduledDate)

    if ((i + 1) % dayConfig.postsCount === 0) {
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  return dates
}

function getDayConfig(config: any, dayOfWeek: number) {
  const days = [
    { enabled: config.sunday_enabled, startTime: config.sunday_start_time || "10:00", endTime: config.sunday_end_time || "14:00", postsCount: config.sunday_posts_count || 1 },
    { enabled: config.monday_enabled, startTime: config.monday_start_time || "09:00", endTime: config.monday_end_time || "17:00", postsCount: config.monday_posts_count || 3 },
    { enabled: config.tuesday_enabled, startTime: config.tuesday_start_time || "09:00", endTime: config.tuesday_end_time || "17:00", postsCount: config.tuesday_posts_count || 3 },
    { enabled: config.wednesday_enabled, startTime: config.wednesday_start_time || "09:00", endTime: config.wednesday_end_time || "17:00", postsCount: config.wednesday_posts_count || 3 },
    { enabled: config.thursday_enabled, startTime: config.thursday_start_time || "09:00", endTime: config.thursday_end_time || "17:00", postsCount: config.thursday_posts_count || 3 },
    { enabled: config.friday_enabled, startTime: config.friday_start_time || "09:00", endTime: config.friday_end_time || "17:00", postsCount: config.friday_posts_count || 3 },
    { enabled: config.saturday_enabled, startTime: config.saturday_start_time || "10:00", endTime: config.saturday_end_time || "14:00", postsCount: config.saturday_posts_count || 1 },
  ]
  return days[dayOfWeek]
}

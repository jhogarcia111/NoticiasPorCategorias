import { getDb } from "@/lib/db"
import { schedulingConfigs, scheduledPosts } from "@noticias/database"
import { eq, and, gte, lte, asc } from "drizzle-orm"

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
  const [post] = await db
    .insert(scheduledPosts)
    .values({ userId, ...postData })
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

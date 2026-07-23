import { getDb, scheduledPosts, subscriptions, subscriptionPlans } from "@noticias/database"
import { eq, and, gte, sql } from "drizzle-orm"
import { getPlanLimits } from "./plan-limits"

export async function checkPostLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number; message?: string }> {
  const db = getDb()

  const [sub] = await db
    .select({ slug: subscriptionPlans.slug })
    .from(subscriptions)
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1)

  const slug = sub?.slug || "free"
  const limits = getPlanLimits(slug)
  if (limits.postsPerMonth === Infinity) {
    return { allowed: true, used: 0, limit: Infinity }
  }

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scheduledPosts)
    .where(and(
      eq(scheduledPosts.userId, userId),
      eq(scheduledPosts.status, "published"),
      gte(scheduledPosts.postedAt, monthStart),
    ))

  const used = result?.count || 0
  const allowed = used < limits.postsPerMonth

  return {
    allowed,
    used,
    limit: limits.postsPerMonth,
    message: allowed
      ? undefined
      : `Alcanzaste el límite de ${limits.postsPerMonth} publicaciones de tu plan. Actualiza a un plan superior para publicar más.`,
  }
}
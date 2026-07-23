import { NextResponse } from "next/server"
import { checkPostLimit } from "@/lib/check-limit"
import { getPlanLimits } from "@/lib/plan-limits"
import { getDb, subscriptions, subscriptionPlans } from "@noticias/database"
import { eq, and } from "drizzle-orm"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const db = getDb()
  const [sub] = await db
    .select({ slug: subscriptionPlans.slug, name: subscriptionPlans.name })
    .from(subscriptions)
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1)

  const slug = sub?.slug || "free"
  const limits = getPlanLimits(slug)
  const limit = await checkPostLimit(userId)

  return NextResponse.json({
    plan: sub?.name || "Gratis",
    slug,
    ...limit,
    limitLabel: limits.postsPerMonth === Infinity ? "Ilimitadas" : String(limits.postsPerMonth),
  })
}
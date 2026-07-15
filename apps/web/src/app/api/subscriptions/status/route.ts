import { NextResponse } from "next/server"
import { getDb, subscriptions, subscriptionPlans } from "@noticias/database"
import { eq, and, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getDb()

    const [subscription] = await db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        trialEndsAt: subscriptions.trialEndsAt,
        canceledAt: subscriptions.canceledAt,
        createdAt: subscriptions.createdAt,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          slug: subscriptionPlans.slug,
          priceInCents: subscriptionPlans.priceInCents,
          currency: subscriptionPlans.currency,
          interval: subscriptionPlans.interval,
          features: subscriptionPlans.features,
        },
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(and(eq(subscriptions.userId, session.user.id), inArray(subscriptions.status, ["active", "past_due", "trialing", "pending"])))
      .limit(1)

    return NextResponse.json({ data: subscription || null })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

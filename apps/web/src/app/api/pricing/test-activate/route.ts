import { NextResponse } from "next/server"
import { getDb, subscriptionPlans, subscriptions, profiles } from "@noticias/database"
import { eq, and, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getDb()

    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, session.user.id),
        inArray(subscriptions.status, ["active", "past_due", "trialing", "pending"])
      ))
      .limit(1)

    if (existingSub) {
      return NextResponse.json({ error: "Ya tienes una suscripción activa o pendiente" }, { status: 409 })
    }

    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.slug, "premium_monthly"))
      .limit(1)

    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() + 30)

    await db.insert(subscriptions).values({
      userId: session.user.id,
      planId: plan?.id || 1,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    })

    return NextResponse.json({
      data: {
        message: "Premium activado en modo prueba por 30 días",
        expiresAt: periodEnd.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Test activate error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
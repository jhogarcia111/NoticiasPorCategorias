import { NextResponse } from "next/server"
import { getDb, subscriptions, subscriptionPlans, profiles } from "@noticias/database"
import { eq, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getDb()

    const allSubs = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        status: subscriptions.status,
        planId: subscriptions.planId,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        planName: subscriptionPlans.name,
        planSlug: subscriptionPlans.slug,
        username: profiles.username,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .leftJoin(profiles, eq(subscriptions.userId, profiles.id))
      .orderBy(desc(subscriptions.createdAt))

    return NextResponse.json({ data: allSubs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { subscriptionId, status } = await request.json()
    if (!subscriptionId || !status) {
      return NextResponse.json({ error: "subscriptionId y status requeridos" }, { status: 400 })
    }

    const validStatuses = ["active", "canceled", "expired", "past_due"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    const db = getDb()
    await db
      .update(subscriptions)
      .set({ status, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))

    return NextResponse.json({ data: { message: "Suscripción actualizada" } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
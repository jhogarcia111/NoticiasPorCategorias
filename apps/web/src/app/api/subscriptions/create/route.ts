import { NextResponse } from "next/server"
import { getDb, subscriptionPlans, subscriptions, profiles } from "@noticias/database"
import { eq, and, inArray } from "drizzle-orm"
import { getAcceptanceToken, createPaymentSource, createTransaction } from "@/lib/wompi"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { planSlug, cardToken, acceptanceToken } = await request.json()
    if (!planSlug || !cardToken || !acceptanceToken) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    const db = getDb()

    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(and(eq(subscriptionPlans.slug, planSlug), eq(subscriptionPlans.isActive, true)))
      .limit(1)

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
    }

    const userEmail = session.user.email || `${session.user.id}@placeholder.com`

    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, session.user.id), inArray(subscriptions.status, ["active", "past_due", "trialing", "pending"])))
      .limit(1)

    if (existingSub) {
      return NextResponse.json({ error: "Ya tienes una suscripción activa o pendiente" }, { status: 409 })
    }

    const paymentSource = await createPaymentSource({
      token: cardToken,
      customerEmail: userEmail,
      acceptanceToken,
    })

    const reference = `sub_${session.user.id}_${Date.now()}`

    const transaction = await createTransaction({
      amountInCents: plan.priceInCents,
      currency: plan.currency,
      reference,
      paymentSourceId: paymentSource.data.id,
      customerEmail: userEmail,
    })

    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await db.insert(subscriptions).values({
      userId: session.user.id,
      planId: plan.id,
      status: "pending",
      wompiPaymentSourceId: paymentSource.data.id,
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    })

    return NextResponse.json({
      data: {
        transactionId: transaction.data.id,
        reference,
        status: transaction.data.status,
      },
    })
  } catch (error: any) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: error.message || "Error al procesar el pago" }, { status: 500 })
  }
}

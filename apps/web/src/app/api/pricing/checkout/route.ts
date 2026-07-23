import { NextResponse } from "next/server"
import { getDb, subscriptionPlans, subscriptions } from "@noticias/database"
import { eq, and, inArray } from "drizzle-orm"
import { generateIntegritySignature } from "@/lib/wompi"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { planSlug } = await request.json()
    if (!planSlug) {
      return NextResponse.json({ error: "planSlug requerido" }, { status: 400 })
    }

    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUB_KEY || process.env.WOMPI_PUB_KEY || ""
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY || ""

    if (!publicKey || !integrityKey) {
      return NextResponse.json({
        testMode: true,
        hint: "Wompi no configurado. Usa POST /api/pricing/test-activate para activar premium en modo prueba.",
      })
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

    const PRICE_MAP: Record<string, { cents: number; currency: string }> = {
      pro: { cents: 2900, currency: "USD" },
      business: { cents: 7900, currency: "USD" },
      pioneer_cofounder: { cents: 1000000, currency: "COP" },
    }

    const price = PRICE_MAP[planSlug]
    if (!price) {
      return NextResponse.json({ error: "Plan sin precio configurado" }, { status: 500 })
    }

    const reference = `sub_${session.user.id}_${Date.now()}`
    const integritySignature = generateIntegritySignature(reference, price.cents, price.currency)

    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() + 30)

    await db.insert(subscriptions).values({
      userId: session.user.id,
      planId: plan.id,
      status: "pending",
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    })

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || "http://localhost:4017"
    const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${price.currency}&amount-in-cents=${price.cents}&reference=${reference}&signature:integrity=${integritySignature}&redirect-url=${encodeURIComponent(appBaseUrl + "/dashboard?tab=subscription&success=true")}`

    return NextResponse.json({
      checkoutUrl,
      reference,
      publicKey,
      integritySignature,
      amountInCents: price.cents,
      currency: price.currency,
      plan: { name: plan.name, priceInCents: price.cents, currency: price.currency },
    })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: error.message || "Error al crear checkout" }, { status: 500 })
  }
}
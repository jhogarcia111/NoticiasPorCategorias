import { NextResponse } from "next/server"
import { getDb, subscriptions, subscriptionPlans } from "@noticias/database"
import { eq, and, inArray } from "drizzle-orm"
import { verifyWebhookSignature, verifyDeployTrackerSignature } from "@/lib/wompi"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()

    const deploySig = request.headers.get("x-deploytracker-signature")
    const deployTs = request.headers.get("x-deploytracker-timestamp")
    const secretToken = process.env.DEPLOYTRACKER_WEBHOOK_SECRET

    let isValid = false

    if (deploySig && deployTs && secretToken) {
      isValid = verifyDeployTrackerSignature(deploySig, deployTs, secretToken)
    } else {
      const checksum = request.headers.get("x-event-checksum") || request.headers.get("x-signature") || ""
      isValid = !!checksum && verifyWebhookSignature(rawBody, checksum)
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    if (payload.event !== "transaction.updated") {
      return NextResponse.json({ received: true })
    }

    const tx = payload.data?.transaction
    if (!tx?.reference || !tx?.payment_source_id) {
      return NextResponse.json({ error: "Missing transaction data" }, { status: 400 })
    }

    if (!tx.reference.startsWith("sub_")) {
      return NextResponse.json({ received: true })
    }

    const db = getDb()
    const newStatus = mapWompiStatus(tx.status)

    const [subscription] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.wompiPaymentSourceId, tx.payment_source_id),
        inArray(subscriptions.status, ["pending", "active", "past_due"]),
      ))
      .limit(1)

    if (!subscription) {
      return NextResponse.json({ received: true })
    }

    await db
      .update(subscriptions)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscription.id))

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function mapWompiStatus(wompiStatus: string): "active" | "incomplete" | "past_due" | "canceled" | "pending" {
  switch (wompiStatus) {
    case "APPROVED":
      return "active"
    case "DECLINED":
      return "incomplete"
    case "VOIDED":
      return "canceled"
    case "ERROR":
      return "incomplete"
    case "PENDING":
      return "pending"
    default:
      return "incomplete"
  }
}

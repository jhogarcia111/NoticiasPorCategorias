import { NextResponse } from "next/server"
import { getDb, subscriptionPlans } from "@noticias/database"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const db = getDb()
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.priceInCents)

    return NextResponse.json({ data: plans })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

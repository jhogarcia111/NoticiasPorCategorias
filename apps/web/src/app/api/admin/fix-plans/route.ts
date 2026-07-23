import { NextResponse } from "next/server"
import { getDb, subscriptionPlans } from "@noticias/database"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

const CORRECT_VALUES: Record<string, { priceInCents: number; currency: string }> = {
  pro: { priceInCents: 11000000, currency: "COP" },
  business: { priceInCents: 30000000, currency: "COP" },
  pioneer_cofounder: { priceInCents: 1000000, currency: "COP" },
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getDb()
    const fixed: string[] = []

    for (const [slug, vals] of Object.entries(CORRECT_VALUES)) {
      await db
        .update(subscriptionPlans)
        .set({ priceInCents: vals.priceInCents, currency: vals.currency })
        .where(eq(subscriptionPlans.slug, slug))

      fixed.push(`${slug}: ${vals.priceInCents} ${vals.currency}`)
    }

    return NextResponse.json({ data: { message: "Planes corregidos", fixed } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getDb()
    const plans = await db.select().from(subscriptionPlans)

    const issues = plans
      .filter((p) => {
        const correct = CORRECT_VALUES[p.slug]
        if (!correct) return false
        return p.priceInCents !== correct.priceInCents || p.currency !== correct.currency
      })
      .map((p) => ({
        slug: p.slug,
        current: { priceInCents: p.priceInCents, currency: p.currency },
        expected: CORRECT_VALUES[p.slug],
      }))

    return NextResponse.json({ data: { plans, issues } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
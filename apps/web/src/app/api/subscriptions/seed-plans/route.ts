import { NextResponse } from "next/server"
import { getDb, subscriptionPlans } from "@noticias/database"
import { eq } from "drizzle-orm"

const SEED_PLANS = [
  {
    name: "Pro",
    slug: "pro",
    description: "Para profesionales que crecen en LinkedIn",
    priceInCents: 29000,
    currency: "COP",
    interval: "month",
    trialDays: 14,
    features: [
      "Publicaciones ilimitadas",
      "Texto completo sin límites",
      "3 perfiles de LinkedIn",
      "10 categorías de noticias",
      "Calendario inteligente",
      "Programación automática",
      "4 estilos de escritura",
      "Soporte prioritario",
    ],
  },
  {
    name: "Business",
    slug: "business",
    description: "Para agencias y equipos",
    priceInCents: 79000,
    currency: "COP",
    interval: "month",
    trialDays: 14,
    features: [
      "Todo lo de Pro",
      "Perfiles ilimitados de LinkedIn",
      "Categorías ilimitadas",
      "Hasta 3 miembros de equipo",
      "API access",
      "Soporte dedicado 24/7",
    ],
  },
]

export async function POST() {
  try {
    const db = getDb()

    for (const plan of SEED_PLANS) {
      const [existing] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.slug, plan.slug))
        .limit(1)

      if (!existing) {
        await db.insert(subscriptionPlans).values(plan)
      }
    }

    return NextResponse.json({ message: "Planes creados exitosamente" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

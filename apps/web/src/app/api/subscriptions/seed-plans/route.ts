import { NextResponse } from "next/server"
import { getDb, subscriptionPlans } from "@noticias/database"
import { eq } from "drizzle-orm"

const SEED_PLANS = [
  {
    name: "Pionero Cofundador",
    slug: "pioneer_cofounder",
    description: "50% descuento por lanzamiento. Precio especial pioneros de por vida.",
    priceInCents: 1000000,
    currency: "COP",
    interval: "month",
    trialDays: 0,
    features: [
      "Publicaciones ilimitadas",
      "Texto completo sin límites",
      "3 perfiles de LinkedIn",
      "10 categorías de noticias",
      "Calendario inteligente",
      "Programación automática",
      "4 estilos de escritura",
      "Soporte prioritario",
      "Precio congelado de por vida",
    ],
  },
  {
    name: "Pro",
    slug: "pro",
    description: "Para profesionales que crecen en LinkedIn (equivalente a $29 USD)",
    priceInCents: 11000000,
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
    description: "Para agencias y equipos (equivalente a $79 USD)",
    priceInCents: 30000000,
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

      if (existing) {
        await db.update(subscriptionPlans).set(plan).where(eq(subscriptionPlans.slug, plan.slug))
      } else {
        await db.insert(subscriptionPlans).values(plan)
      }
    }

    return NextResponse.json({ message: "Planes creados exitosamente" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

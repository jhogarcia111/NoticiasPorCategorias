import { db } from "./db"
import { categories } from "./schema"

const defaultCategories = [
  { name: "Tecnolog\u00eda", description: "Noticias sobre tecnolog\u00eda, startups y innovaci\u00f3n", newsapiCategory: "technology", providerType: "newsapi", isActive: true },
  { name: "Negocios", description: "Noticias empresariales y financieras", newsapiCategory: "business", providerType: "newsapi", isActive: true },
  { name: "Finanzas", description: "Mercados financieros y econom\u00eda", newsapiCategory: "business", providerType: "newsapi", isActive: true },
  { name: "Salud", description: "Noticias sobre salud y medicina", newsapiCategory: "health", providerType: "newsapi", isActive: true },
  { name: "Ciencia", description: "Avances cient\u00edficos e investigaci\u00f3n", newsapiCategory: "science", providerType: "newsapi", isActive: true },
]

async function seed() {
  console.log("Seeding database...")

  for (const cat of defaultCategories) {
    const existing = await db.select().from(categories).where(
      Object.assign({}, { name: cat.name })
    )

    if (existing.length === 0) {
      await db.insert(categories).values(cat)
      console.log(`  Created category: ${cat.name}`)
    }
  }

  console.log("Seed complete!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})

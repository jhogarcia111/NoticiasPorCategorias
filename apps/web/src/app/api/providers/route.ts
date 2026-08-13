import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { categories } from "@noticias/database"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { searchScientific, searchPatents, scrapeUrlContent, providerStatus, detectNiche } from "@/services/providers"
import { saveProviderArticles } from "@/services/provider-service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  return NextResponse.json({ data: providerStatus() })
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const { source, categoryId, query, url, niche, limit } = await request.json().catch(() => ({}))
    if (!source || !["scientific", "patents", "url"].includes(source)) {
      return NextResponse.json({ error: "source inválido. Usa scientific, patents o url" }, { status: 400 })
    }
    if (source === "url" && !url) {
      return NextResponse.json({ error: "Se requiere una URL para importar" }, { status: 400 })
    }
    if (source !== "url" && !query) {
      return NextResponse.json({ error: "Se requiere un query de búsqueda" }, { status: 400 })
    }

    const db = getDb()

    let catId = categoryId ? Number(categoryId) : null
    let categoryName = ""
    if (catId) {
      const cats = await db.select({ name: categories.name }).from(categories).where(eq(categories.id, catId)).limit(1)
      categoryName = cats[0]?.name || ""
    } else {
      const cats = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(eq(categories.isActive, true))
        .limit(1)
      if (cats.length === 0) {
        return NextResponse.json({ error: "No hay categorías activas. Crea una categoría primero." }, { status: 404 })
      }
      catId = cats[0].id
      categoryName = cats[0].name
    }

    const articleList = source === "url" ? await scrapeUrlContent(url) : null

    const detectedNiche = niche || (source !== "url" ? detectNiche(categoryName) : "general")

    let results: any[] = []
    let errors: string[] = []

    if (source === "url") {
      const { inserted, duplicates } = await saveProviderArticles([articleList!], catId, userId)
      results = inserted
      if (duplicates > 0) errors.push(`${duplicates} artículo(s) ya estaban en la base de datos`)
    } else {
      const searchFn = source === "scientific" ? searchScientific : searchPatents
      const found = await searchFn(query, detectedNiche, limit || 10)
      errors = errors.concat(found.errors)
      if (found.results.length > 0) {
        const saved = await saveProviderArticles(found.results, catId, userId)
        results = saved.inserted
        if (saved.duplicates > 0) errors.push(`${saved.duplicates} artículo(s) ya estaban en la base de datos`)
      } else {
        errors.push("No se encontraron resultados para esta búsqueda")
      }
    }

    return NextResponse.json({
      data: {
        source,
        categoryId: catId,
        collected: results.length,
        inserted: results,
        errors,
        providerStatus: providerStatus(),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
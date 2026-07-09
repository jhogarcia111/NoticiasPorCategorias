import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { categories } from "@noticias/database"
import { eq } from "drizzle-orm"
import { fetchNewsFromAPI, processAndSaveNews } from "@/services/news-service"

export async function POST(request: Request) {
  try {
    const { categoryId } = await request.json().catch(() => ({}))
    const db = getDb()

    let cats
    if (categoryId) {
      cats = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1)
    } else {
      cats = await db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
    }

    if (!cats || cats.length === 0) {
      return NextResponse.json({ error: "No categories found" }, { status: 404 })
    }

    const results = []
    for (const cat of cats) {
      try {
        const articles = await fetchNewsFromAPI({
          category: cat.newsapiCategory || "technology",
          pageSize: 10,
        })
        const processed = await processAndSaveNews(articles, cat.id)
        results.push({
          category: cat.name,
          collected: processed.length,
          total: articles.length,
        })
      } catch (err: any) {
        results.push({
          category: cat.name,
          error: err.message,
        })
      }
    }

    return NextResponse.json({ data: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

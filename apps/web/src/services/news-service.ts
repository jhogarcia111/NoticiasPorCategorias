import { getDb } from "@/lib/db"
import { news, categories } from "@noticias/database"
import { eq, desc, and, sql } from "drizzle-orm"

const NEWSAPI_BASE_URL = "https://newsapi.org/v2"
const NEWSAPI_KEY = process.env.VITE_NEWSAPI_KEY || process.env.NEXT_PUBLIC_NEWSAPI_KEY

export async function fetchNewsFromAPI(options: {
  category?: string
  country?: string
  pageSize?: number
  page?: number
  query?: string
} = {}) {
  const { category = "technology", country = "us", pageSize = 20, page = 1, query = "" } = options

  const params = new URLSearchParams({
    apiKey: NEWSAPI_KEY || "",
    category,
    country,
    pageSize: pageSize.toString(),
    page: page.toString(),
  })

  if (query) params.append("q", query)

  const response = await fetch(`${NEWSAPI_BASE_URL}/top-headlines?${params}`)
  if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`)

  const data = await response.json()
  if (data.status !== "ok") throw new Error(`NewsAPI error: ${data.message}`)

  return data.articles || []
}

export async function getNewsFromDatabase(options: {
  categoryId?: number | null
  limit?: number
  offset?: number
  processed?: boolean | null
} = {}) {
  const { categoryId = null, limit = 20, offset = 0, processed = true } = options

  const conditions = []
  if (categoryId) conditions.push(eq(news.categoryId, categoryId))
  if (processed !== null) conditions.push(eq(news.isProcessed, processed))

  const db = getDb()
  const query = db
    .select()
    .from(news)
    .leftJoin(categories, eq(news.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(news.publishedAt))
    .limit(limit)
    .offset(offset)

  const result = await query
  return result.map((r) => ({ ...r.news, category: r.categories }))
}

export async function processAndSaveNews(articles: any[], categoryId: number) {
  const db = getDb()
  const processedNews = []

  for (const article of articles) {
    const existing = await db
      .select({ id: news.id })
      .from(news)
      .where(eq(news.sourceUrl, article.url))
      .limit(1)

    if (existing.length > 0) continue

    const [inserted] = await db
      .insert(news)
      .values({
        categoryId,
        title: article.title || "Sin t\u00edtulo",
        sourceUrl: article.url,
        imageUrl: article.urlToImage,
        sourceName: article.source?.name || "Fuente desconocida",
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        summary: article.description,
        isProcessed: false,
      })
      .returning()

    processedNews.push(inserted)
  }

  return processedNews
}

export async function markNewsAsProcessed(newsIds: number[]) {
  const db = getDb()
  await db
    .update(news)
    .set({ isProcessed: true })
    .where(sql`${news.id} = ANY(ARRAY[${newsIds}])`)
}

export async function deleteAllNews() {
  const db = getDb()
  await db.delete(news)
}

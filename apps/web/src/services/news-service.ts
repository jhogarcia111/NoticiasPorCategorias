import { getDb } from "@/lib/db"
import { news, categories, postNews, scheduledPosts } from "@noticias/database"
import { eq, desc, and, sql, inArray } from "drizzle-orm"

const NEWSAPI_BASE_URL = "https://newsapi.org/v2"
const NEWSAPI_KEY = process.env.VITE_NEWSAPI_KEY || process.env.NEXT_PUBLIC_NEWSAPI_KEY

export async function fetchNewsFromAPI(options: {
  category?: string
  country?: string
  pageSize?: number
  page?: number
  query?: string
  language?: string
} = {}) {
  const { category = "technology", country = "", pageSize = 20, page = 1, query = "", language = "" } = options

  // Use /everything if query provided, otherwise /top-headlines
  const isTopHeadlines = !query
  const params = new URLSearchParams({
    apiKey: NEWSAPI_KEY || "",
    pageSize: pageSize.toString(),
    page: page.toString(),
  })

  if (category && isTopHeadlines) params.set("category", category)
  if (country) params.set("country", country)
  if (query) params.set("q", query)
  if (language) params.set("language", language)

  const endpoint = isTopHeadlines ? `${NEWSAPI_BASE_URL}/top-headlines` : `${NEWSAPI_BASE_URL}/everything`

  const response = await fetch(`${endpoint}?${params}`)
  if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`)

  const data = await response.json()
  if (data.status !== "ok") throw new Error(`NewsAPI error: ${data.message}`)

  return data.articles || []
}

export async function searchNewsEverything(query: string, pageSize: number = 20, language: string = "es") {
  const params = new URLSearchParams({
    apiKey: NEWSAPI_KEY || "",
    q: query,
    pageSize: pageSize.toString(),
    language,
    sortBy: "relevancy",
  })

  const response = await fetch(`${NEWSAPI_BASE_URL}/everything?${params}`)
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

export async function processAndSaveNews(articles: any[], categoryId: number, language?: string) {
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
        title: article.title || "Sin título",
        sourceUrl: article.url,
        imageUrl: article.urlToImage,
        sourceName: article.source?.name || "Fuente desconocida",
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        summary: article.description,
        language: language || "es",
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
    .where(inArray(news.id, newsIds))
}

export async function deleteAllNews() {
  const db = getDb()
  await db.delete(news)
}

export async function getPublishedNewsIds(): Promise<number[]> {
  const db = getDb()
  const rows = await db
    .select({ newsId: postNews.newsId })
    .from(postNews)
    .innerJoin(scheduledPosts, eq(postNews.postId, scheduledPosts.id))
    .where(eq(scheduledPosts.status, "published"))
  return rows.map((r) => r.newsId)
}

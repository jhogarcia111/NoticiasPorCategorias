import { getDb } from "@/lib/db"
import { news } from "@noticias/database"
import { and, eq } from "drizzle-orm"
import type { StandardArticleContext } from "./providers"

export interface SavedProviderArticle {
  id: number
  title: string
  sourceUrl: string
  sourceType: string
}

export async function saveProviderArticles(
  articles: StandardArticleContext[],
  categoryId: number,
  userId: string,
  language = "es",
): Promise<{ inserted: SavedProviderArticle[]; duplicates: number }> {
  const db = getDb()
  const inserted: SavedProviderArticle[] = []
  let duplicates = 0

  for (const article of articles) {
    if (!article.source_url) continue

    const existing = await db
      .select({ id: news.id })
      .from(news)
      .where(and(eq(news.userId, userId), eq(news.sourceUrl, article.source_url)))
      .limit(1)

    if (existing.length > 0) {
      duplicates += 1
      continue
    }

    const summary = (article.summary_raw || "").trim()
    const [row] = await db
      .insert(news)
      .values({
        userId,
        categoryId,
        title: article.title || "Sin título",
        sourceUrl: article.source_url,
        imageUrl: article.image_url ?? null,
        sourceName: article.source_name || article.category_niche || "Fuente externa",
        sourceType: article.source_type,
        publishedAt: article.published_at ? new Date(article.published_at) : new Date(),
        summary: summary.slice(0, 3000) || null,
        content: summary.slice(0, 20000) || null,
        language: article.language || language,
        isProcessed: false,
        aiResults: {
          key_entities: article.key_entities || [],
          category_niche: article.category_niche || "",
        },
      })
      .returning()

    inserted.push({ id: row.id, title: row.title, sourceUrl: row.sourceUrl, sourceType: row.sourceType || article.source_type })
  }

  return { inserted, duplicates }
}
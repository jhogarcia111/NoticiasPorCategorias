import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { categories, newsSources } from "@noticias/database"
import { eq } from "drizzle-orm"
import { fetchNewsFromAPI, processAndSaveNews } from "@/services/news-service"

const NEWSAPI_KEY = process.env.VITE_NEWSAPI_KEY || process.env.NEXT_PUBLIC_NEWSAPI_KEY

function stripCDATA(text: string) {
  return text.replace(/<!\[CDATA\[([^\]]*)\]\]>/g, "$1")
}

function extractTagContent(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi")
  const results: string[] = []
  let match
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1].trim())
  }
  return results
}

async function fetchRSSFeed(url: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    const raw = await res.text()
    const text = stripCDATA(raw)
    const articles: any[] = []

    const titles = extractTagContent(text, "title")
    const links = extractTagContent(text, "link")
    const descriptions = extractTagContent(text, "description")
    const pubDates = extractTagContent(text, "pubDate")

    // Channel title is at index 0, items start at index 1
    for (let i = 1; i < titles.length; i++) {
      const title = titles[i]
        .replace(/<\/?[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .trim()

      if (!title || title.length < 3) continue

      let link = links?.[i]?.replace(/<\/?[^>]+>/g, "").trim() || ""
      // Some feeds use <link> without inner text but with href attribute
      if (!link) {
        const linkMatch = links?.[i]?.match(/href\s*=\s*["']([^"']+)["']/)
        if (linkMatch) link = linkMatch[1]
      }

      const description = (descriptions?.[i] || "")
        .replace(/<\/?[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .trim()

      const pubDate = pubDates?.[i - 1]?.trim() || ""

      articles.push({
        title,
        url: link,
        description: description.substring(0, 500),
        source: { name: new URL(url).hostname.replace(/^www\./, "") },
        publishedAt: pubDate || new Date().toISOString(),
        urlToImage: null,
      })
    }

    return articles
  } catch (e: any) {
    console.error(`RSS fetch error for ${url}:`, e.message)
    return []
  }
}

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
      return NextResponse.json({ error: "No categories found. Run the seed first or create categories." }, { status: 404 })
    }

    const sources = await db
      .select()
      .from(newsSources)
      .where(eq(newsSources.isActive, true))
      .catch(() => [])

    const results = []

    for (const cat of cats) {
      const catResult: any = {
        category: cat.name,
        categoryId: cat.id,
        collected: 0,
        total: 0,
        errors: [] as string[],
        sources: [] as string[],
      }

      try {
        if (cat.newsapiCategory && NEWSAPI_KEY) {
          const articles = await fetchNewsFromAPI({
            category: cat.newsapiCategory || "technology",
            pageSize: 10,
          }).catch((e) => {
            catResult.errors.push(`NewsAPI: ${e.message}`)
            return []
          })

          if (articles.length > 0) {
            const processed = await processAndSaveNews(articles, cat.id)
            catResult.collected += processed.length
            catResult.total += articles.length
            catResult.sources.push("NewsAPI")
          }
        }

        if (cat.rssFeedUrl) {
          try {
            const rssArticles = await fetchRSSFeed(cat.rssFeedUrl)
            if (rssArticles.length > 0) {
              const processed = await processAndSaveNews(rssArticles, cat.id)
              catResult.collected += processed.length
              catResult.total += rssArticles.length
              catResult.sources.push("RSS")
            }
          } catch (e: any) {
            catResult.errors.push(`RSS: ${e.message}`)
          }
        }

        const catSources = sources.filter((s: any) => s.categoryId === cat.id)
        for (const source of catSources) {
          if (source.type === "rss") {
            try {
              const rssArticles = await fetchRSSFeed(source.url)
              if (rssArticles.length > 0) {
                const processed = await processAndSaveNews(rssArticles, cat.id)
                catResult.collected += processed.length
                catResult.total += rssArticles.length
                catResult.sources.push(source.name)
              }
            } catch (e: any) {
              catResult.errors.push(`${source.name}: ${e.message}`)
            }
          }
        }

        if (catResult.collected === 0 && catResult.errors.length === 0) {
          catResult.errors.push("No se encontraron noticias nuevas (pueden ya estar en la base de datos)")
        }
      } catch (err: any) {
        catResult.errors.push(err.message)
      }

      results.push(catResult)
    }

    const uncategorizedSources = sources.filter((s: any) => !s.categoryId)
    for (const source of uncategorizedSources) {
      const catResult: any = {
        category: source.name,
        collected: 0,
        total: 0,
        errors: [] as string[],
        sources: [source.name],
      }

      if (source.type === "rss") {
        try {
          const rssArticles = await fetchRSSFeed(source.url)
          if (rssArticles.length > 0) {
            const firstCatId = cats[0]?.id
            if (firstCatId) {
              const processed = await processAndSaveNews(rssArticles, firstCatId)
              catResult.collected = processed.length
              catResult.total = rssArticles.length
            }
          }
        } catch (e: any) {
          catResult.errors.push(e.message)
        }
      }

      results.push(catResult)
    }

    const totalCollected = results.reduce((sum, r) => sum + (r.collected || 0), 0)
    const totalErrors = results.reduce((sum, r) => sum + (r.errors?.length || 0), 0)

    return NextResponse.json({
      data: results,
      summary: {
        totalCollected,
        categoriesProcessed: results.length,
        categoriesWithErrors: results.filter((r) => r.errors?.length > 0).length,
        hasApiKey: !!NEWSAPI_KEY,
        apiKeyEnding: NEWSAPI_KEY ? NEWSAPI_KEY.slice(-4) : null,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import {
  generateNewsSummary,
  generateLinkedInPost,
  generateHashtags,
  generateImagePrompt,
  generateImagePrompts,
  generateNewsImageData,
  generateHeadlines,
  generateBlogArticle,
  generateVideoScript,
} from "@/services/ai-service"
import { getDb } from "@/lib/db"
import { news } from "@noticias/database"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const body = await request.json()
    const { type } = body

    switch (type) {
      case "summary": {
        const result = await generateNewsSummary(body.content, body.options?.language)
        return NextResponse.json({ data: result })
      }
      case "image-prompt": {
        const result = await generateImagePrompt(body.title, body.summary)
        return NextResponse.json({ data: result })
      }
      case "image-prompts": {
        const result = await generateImagePrompts(body.title, body.summary)
        return NextResponse.json({ data: result })
      }
      case "news-image-data": {
        const result = await generateNewsImageData(body.title, body.summary)
        return NextResponse.json({ data: result })
      }
      case "headlines": {
        const result = await generateHeadlines(body.title, body.summary)
        return NextResponse.json({ data: result })
      }
      case "linkedin-post": {
        const result = await generateLinkedInPost(body.newsItems, body.options)
        return NextResponse.json({ data: result })
      }
      case "hashtags": {
        const result = await generateHashtags(body.title, body.summary)
        return NextResponse.json({ data: result })
      }
      case "blog": {
        const result = await generateBlogArticle(body.title, body.summary, body.options)
        return NextResponse.json({ data: result })
      }
      case "video-script": {
        const result = await generateVideoScript(body.title, body.summary, body.options)
        return NextResponse.json({ data: result })
      }
      case "process-news": {
        const db = getDb()
        const [item] = await db
          .select()
          .from(news)
          .where(and(eq(news.id, body.newsId), eq(news.userId, userId)))
          .limit(1)
        if (!item) return NextResponse.json({ error: "News not found" }, { status: 404 })
        const summary = await generateNewsSummary(item.summary || item.title || "", "es")
        await db
          .update(news)
          .set({ aiSummary: summary, isProcessed: true })
          .where(and(eq(news.id, body.newsId), eq(news.userId, userId)))
        return NextResponse.json({ data: { id: body.newsId, aiSummary: summary } })
      }
      case "process-multiple": {
        const db = getDb()
        const results = []
        for (const id of body.newsIds) {
          const [item] = await db
            .select()
            .from(news)
            .where(and(eq(news.id, id), eq(news.userId, userId)))
            .limit(1)
          if (!item) continue
          const summary = await generateNewsSummary(item.summary || item.title || "", "es")
          await db
            .update(news)
            .set({ aiSummary: summary, isProcessed: true })
            .where(and(eq(news.id, id), eq(news.userId, userId)))
          results.push({ id, aiSummary: summary })
        }
        return NextResponse.json({ data: results })
      }
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

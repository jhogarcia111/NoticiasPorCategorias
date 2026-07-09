import { NextResponse } from "next/server"
import {
  generateNewsSummary,
  generateLinkedInPost,
  generateHashtags,
  generateImagePrompt,
} from "@/services/ai-service"
import { getDb } from "@/lib/db"
import { news } from "@noticias/database"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
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
      case "linkedin-post": {
        const result = await generateLinkedInPost(body.newsItems, body.options)
        return NextResponse.json({ data: result })
      }
      case "hashtags": {
        const result = await generateHashtags(body.title, body.summary)
        return NextResponse.json({ data: result })
      }
      case "process-news": {
        const db = getDb()
        const [item] = await db
          .select()
          .from(news)
          .where(eq(news.id, body.newsId))
          .limit(1)
        if (!item) return NextResponse.json({ error: "News not found" }, { status: 404 })
        const summary = await generateNewsSummary(item.summary || item.title || "", "es")
        await db
          .update(news)
          .set({ aiSummary: summary, isProcessed: true })
          .where(eq(news.id, body.newsId))
        return NextResponse.json({ data: { id: body.newsId, aiSummary: summary } })
      }
      case "process-multiple": {
        const db = getDb()
        const results = []
        for (const id of body.newsIds) {
          const [item] = await db
            .select()
            .from(news)
            .where(eq(news.id, id))
            .limit(1)
          if (!item) continue
          const summary = await generateNewsSummary(item.summary || item.title || "", "es")
          await db
            .update(news)
            .set({ aiSummary: summary, isProcessed: true })
            .where(eq(news.id, id))
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

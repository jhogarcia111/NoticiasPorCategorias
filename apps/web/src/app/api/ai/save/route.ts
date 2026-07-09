import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { newsAiResults } from "@noticias/database"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { newsId, templateId, templateName, language, summary, linkedinPost, hashtags, imagePrompt, fullResponse } = body

    if (!newsId) {
      return NextResponse.json({ error: "newsId is required" }, { status: 400 })
    }

    const db = getDb()
    const [result] = await db
      .insert(newsAiResults)
      .values({
        newsId,
        templateId: templateId || "default",
        templateName: templateName || null,
        language: language || "es",
        summary: summary || null,
        linkedinPost: linkedinPost || null,
        hashtags: hashtags || null,
        imagePrompt: imagePrompt || null,
        fullResponse: fullResponse || null,
      })
      .returning()

    return NextResponse.json({ data: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

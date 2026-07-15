import { NextResponse } from "next/server"
import { getDb, newsAiResults, news } from "@noticias/database"
import { desc, sql } from "drizzle-orm"

export async function GET() {
  try {
    const db = getDb()
    const results = await db
      .select({
        id: newsAiResults.id,
        newsId: newsAiResults.newsId,
        templateName: newsAiResults.templateName,
        linkedinPost: newsAiResults.linkedinPost,
        fullResponse: newsAiResults.fullResponse,
        createdAt: newsAiResults.createdAt,
        newsTitle: news.title,
        newsSummary: news.summary,
        newsUrl: news.sourceUrl,
      })
      .from(newsAiResults)
      .leftJoin(news, sql`${newsAiResults.newsId} = ${news.id}`)
      .orderBy(desc(newsAiResults.createdAt))
      .limit(100)

    return NextResponse.json({ data: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

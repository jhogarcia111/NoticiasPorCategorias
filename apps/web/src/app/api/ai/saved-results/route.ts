import { NextResponse } from "next/server"
import { getDb, newsAiResults, news } from "@noticias/database"
import { desc, eq, and, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ data: [] })

    const db = getDb()
    const results = await db
      .select({
        id: newsAiResults.id,
        newsId: newsAiResults.newsId,
        templateName: newsAiResults.templateName,
        linkedinPost: newsAiResults.linkedinPost,
        fullResponse: newsAiResults.fullResponse,
        headlines: newsAiResults.headlines,
        createdAt: newsAiResults.createdAt,
        newsTitle: news.title,
        newsSummary: news.summary,
        newsUrl: news.sourceUrl,
      })
      .from(newsAiResults)
      .leftJoin(news, sql`${newsAiResults.newsId} = ${news.id}`)
      .where(and(eq(newsAiResults.userId, userId), eq(news.userId, userId)))
      .orderBy(desc(newsAiResults.createdAt))
      .limit(100)

    return NextResponse.json({ data: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getDb, newsAiResults } from "@noticias/database"
import { eq, inArray } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const newsIdsParam = searchParams.get("newsIds")
    if (!newsIdsParam) return NextResponse.json({ data: [] })

    const newsIds = newsIdsParam.split(",").map(Number).filter(Boolean)
    if (newsIds.length === 0) return NextResponse.json({ data: [] })

    const db = getDb()
    const results = await db
      .select()
      .from(newsAiResults)
      .where(inArray(newsAiResults.newsId, newsIds))
      .orderBy(newsAiResults.createdAt)

    return NextResponse.json({ data: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getDb, newsAiResults } from "@noticias/database"
import { and, eq, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ data: [] })

    const { searchParams } = new URL(request.url)
    const newsIdsParam = searchParams.get("newsIds")
    if (!newsIdsParam) return NextResponse.json({ data: [] })

    const newsIds = newsIdsParam.split(",").map(Number).filter(Boolean)
    if (newsIds.length === 0) return NextResponse.json({ data: [] })

    const db = getDb()
    const results = await db
      .select()
      .from(newsAiResults)
      .where(and(eq(newsAiResults.userId, userId), inArray(newsAiResults.newsId, newsIds)))
      .orderBy(newsAiResults.createdAt)

    return NextResponse.json({ data: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

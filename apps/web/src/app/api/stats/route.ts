import { NextResponse } from "next/server"
import { getDb, news, scheduledPosts, newsAiResults } from "@noticias/database"
import { eq, count, and, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    const db = getDb()

    const newsConds = []
    const draftsConds = []
    if (userId) {
      newsConds.push(eq(news.userId, userId))
      draftsConds.push(eq(newsAiResults.userId, userId))
    }

    const [newsRow] = await db
      .select({ value: count() })
      .from(news)
      .where(newsConds.length > 0 ? and(...newsConds) : undefined)

    const [unprocessedRow] = await db
      .select({ value: count() })
      .from(news)
      .where(and(...newsConds, eq(news.isProcessed, false)))

    const [draftsRow] = await db
      .select({ value: count(sql`DISTINCT ${newsAiResults.newsId}`) })
      .from(newsAiResults)
      .where(draftsConds.length > 0 ? and(...draftsConds) : undefined)

    const publishedConds = [eq(scheduledPosts.status, "published"), sql`${scheduledPosts.postedAt}::date = CURRENT_DATE`]
    const scheduledConds = [eq(scheduledPosts.status, "scheduled")]
    if (userId) {
      publishedConds.push(eq(scheduledPosts.userId, userId))
      scheduledConds.push(eq(scheduledPosts.userId, userId))
    }

    const [publishedTodayRow] = await db
      .select({ value: count() })
      .from(scheduledPosts)
      .where(and(...publishedConds))

    const [scheduledRow] = await db
      .select({ value: count() })
      .from(scheduledPosts)
      .where(and(...scheduledConds))

    return NextResponse.json({
      data: {
        totalNews: newsRow?.value ?? 0,
        unprocessed: unprocessedRow?.value ?? 0,
        drafts: draftsRow?.value ?? 0,
        scheduled: scheduledRow?.value ?? 0,
        publishedToday: publishedTodayRow?.value ?? 0,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
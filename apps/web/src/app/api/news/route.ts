import { NextResponse } from "next/server"
import { getNewsFromDatabase, markNewsAsProcessed, deleteAllNews } from "@/services/news-service"
import { getDb, news } from "@noticias/database"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("categoryId")
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = parseInt(searchParams.get("offset") || "0")
  const processedParam = searchParams.get("processed")

  try {
    const data = await getNewsFromDatabase({
      categoryId: categoryId ? parseInt(categoryId) : null,
      limit,
      offset,
      processed: processedParam === "true" ? true : processedParam === "false" ? false : null,
    })
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { newsIds } = await request.json()
    if (!newsIds || !Array.isArray(newsIds) || newsIds.length === 0) {
      return NextResponse.json({ error: "newsIds array required" }, { status: 400 })
    }
    await markNewsAsProcessed(newsIds)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const all = searchParams.get("all")
  const categoryId = searchParams.get("categoryId")

  try {
    if (all === "true") {
      await deleteAllNews()
      return NextResponse.json({ success: true })
    }
    if (categoryId) {
      const db = getDb()
      await db.delete(news).where(eq(news.categoryId, parseInt(categoryId)))
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "Specify ?all=true or ?categoryId=X" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

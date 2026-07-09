import { NextResponse } from "next/server"
import { getDb, newsSources, news } from "@noticias/database"
import { eq, desc, sql } from "drizzle-orm"

export async function GET() {
  try {
    const db = getDb()
    const data = await db.select().from(newsSources).orderBy(desc(newsSources.createdAt))
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, url, type, categoryId, language, fetchIntervalMinutes } = body
    if (!name || !url) {
      return NextResponse.json({ error: "name and url required" }, { status: 400 })
    }
    const db = getDb()
    const [source] = await db.insert(newsSources).values({
      name,
      url,
      type: type || "rss",
      categoryId: categoryId || null,
      language: language || "es",
      isActive: true,
      fetchIntervalMinutes: fetchIntervalMinutes || 60,
    }).returning()
    return NextResponse.json({ data: source })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const db = getDb()
    const [source] = await db.update(newsSources)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(newsSources.id, id))
      .returning()
    return NextResponse.json({ data: source })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "")
  const cleanup = searchParams.get("cleanup") === "true"
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  try {
    const db = getDb()
    // Get the source first to know its categoryId
    const [source] = await db.select().from(newsSources).where(eq(newsSources.id, id)).limit(1)
    if (!source) return NextResponse.json({ error: "Source not found" }, { status: 404 })

    // Delete source
    await db.delete(newsSources).where(eq(newsSources.id, id))

    // Optionally delete news in the same category
    let newsDeleted = 0
    if (cleanup && source.categoryId) {
      await db.delete(news).where(eq(news.categoryId, source.categoryId))
      newsDeleted = -1 // indicate that cleanup happened
    } else if (cleanup && !source.categoryId) {
      try {
        const domain = new URL(source.url).hostname
        await db.delete(news).where(sql`${news.sourceUrl} ILIKE ${'%' + domain + '%'}`)
        newsDeleted = -1
      } catch { /* ignore URL parse errors */ }
    }

    return NextResponse.json({ success: true, newsDeleted })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

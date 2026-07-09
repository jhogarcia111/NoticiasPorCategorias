import { NextResponse } from "next/server"
import { getDb, categories } from "@noticias/database"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  try {
    const db = getDb()
    const data = await db.select().from(categories).orderBy(desc(categories.isActive), categories.name)
    return NextResponse.json({ data })
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
    const [category] = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning()

    return NextResponse.json({ data: category })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, newsapiCategory, rssFeedUrl, providerType } = body
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

    const db = getDb()
    const [category] = await db
      .insert(categories)
      .values({
        name,
        description: description || null,
        newsapiCategory: newsapiCategory || null,
        rssFeedUrl: rssFeedUrl || null,
        providerType: providerType || "newsapi",
        isActive: true,
        usageCount: 0,
      })
      .returning()

    return NextResponse.json({ data: category })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = parseInt(searchParams.get("id") || "")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  try {
    const db = getDb()
    await db.delete(categories).where(eq(categories.id, id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

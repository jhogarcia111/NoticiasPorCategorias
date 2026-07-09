import { NextResponse } from "next/server"
import { getDb, categories } from "@noticias/database"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  try {
    const db = getDb()
    const data = await db.select().from(categories).orderBy(desc(categories.id))
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isActive, name, newsapiCategory, description } = await request.json()
    const db = getDb()
    const updates: Record<string, any> = {}
    if (isActive !== undefined) updates.isActive = isActive
    if (name !== undefined) updates.name = name
    if (newsapiCategory !== undefined) updates.newsapiCategory = newsapiCategory
    if (description !== undefined) updates.description = description
    updates.updatedAt = new Date()

    const [cat] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning()
    return NextResponse.json({ data: cat })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, newsapiCategory, query } = await request.json()
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

    const db = getDb()
    const [cat] = await db.insert(categories).values({
      name,
      description: description || null,
      newsapiCategory: newsapiCategory || "technology",
      providerType: "newsapi",
      isActive: true,
    }).returning()

    // If a NewsAPI query was provided, update the category's custom query
    if (query) {
      // Use the apiKeyEncrypted field to store the custom query for now
      // (it's a text field we can repurpose)
    }

    return NextResponse.json({ data: cat })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

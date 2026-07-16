import { NextResponse } from "next/server"
import { getDb, generatedImages } from "@noticias/database"
import { eq, desc, and } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const newsId = searchParams.get("newsId")
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)

    const db = getDb()
    const conditions = [eq(generatedImages.userId, session.user.id)]
    if (newsId) conditions.push(eq(generatedImages.newsId, Number(newsId)))

    const images = await db
      .select()
      .from(generatedImages)
      .where(and(...conditions))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit)

    return NextResponse.json({ data: images })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

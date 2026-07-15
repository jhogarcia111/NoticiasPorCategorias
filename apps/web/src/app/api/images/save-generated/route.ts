import { NextResponse } from "next/server"
import { getDb, generatedImages } from "@noticias/database"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { imageUrl, promptUsed, newsTitle, newsId, headlines } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl requerida" }, { status: 400 })
    }

    const db = getDb()
    const [img] = await db
      .insert(generatedImages)
      .values({
        userId: session.user.id,
        imageUrl,
        promptUsed: promptUsed || null,
        newsTitle: newsTitle || null,
        newsId: newsId || null,
        headlinesJson: headlines ? JSON.stringify(headlines) : null,
      })
      .returning()

    return NextResponse.json({ data: img })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

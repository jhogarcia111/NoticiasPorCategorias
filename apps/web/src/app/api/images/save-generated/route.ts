import { NextResponse } from "next/server"
import { getDb, generatedImages } from "@noticias/database"
import { auth } from "@/lib/auth"

export const maxDuration = 30

async function toPersistentImageUrl(url: string): Promise<string> {
  if (!url.startsWith("http")) return url
  try {
    const resp = await fetch(url)
    if (!resp.ok) return url
    const buffer = Buffer.from(await resp.arrayBuffer())
    const contentType = resp.headers.get("content-type") || "image/jpeg"
    return `data:${contentType};base64,${buffer.toString("base64")}`
  } catch {
    return url
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { imageUrl, promptUsed, newsTitle, newsId, headlines, selectedHeadline, labelConfig } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl requerida" }, { status: 400 })
    }

    const persistentUrl = await toPersistentImageUrl(imageUrl)

    const db = getDb()
    const [img] = await db
      .insert(generatedImages)
      .values({
        userId: session.user.id,
        imageUrl: persistentUrl,
        promptUsed: promptUsed || null,
        newsTitle: newsTitle || null,
        newsId: newsId || null,
        headlinesJson: headlines ? JSON.stringify(headlines) : null,
        selectedHeadline: selectedHeadline || null,
        labelConfig: labelConfig ? JSON.stringify(labelConfig) : null,
      })
      .returning()

    return NextResponse.json({ data: img })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
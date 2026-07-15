import { NextResponse } from "next/server"
import { getDb, generatedImages } from "@noticias/database"
import { eq, and, isNull } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { imageUrl, headlines } = await request.json()
    if (!imageUrl || !headlines) {
      return NextResponse.json({ error: "imageUrl and headlines required" }, { status: 400 })
    }

    const db = getDb()
    await db
      .update(generatedImages)
      .set({ headlinesJson: JSON.stringify(headlines) })
      .where(and(eq(generatedImages.imageUrl, imageUrl), eq(generatedImages.userId, session.user.id)))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getDb, generatedImages } from "@noticias/database"
import { eq, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getDb()
    const images = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.userId, session.user.id))
      .orderBy(desc(generatedImages.createdAt))
      .limit(50)

    return NextResponse.json({ data: images })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

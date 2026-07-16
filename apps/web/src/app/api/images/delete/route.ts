import { NextResponse } from "next/server"
import { getDb, generatedImages } from "@noticias/database"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 })
    }

    const db = getDb()
    await db.delete(generatedImages).where(
      and(eq(generatedImages.id, Number(id)), eq(generatedImages.userId, session.user.id))
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

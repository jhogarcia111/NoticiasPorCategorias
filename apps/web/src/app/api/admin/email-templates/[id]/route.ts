import { NextResponse } from "next/server"
import { getDb, emailTemplates } from "@noticias/database"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: templateId } = await params
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const id = Number(templateId)
    const body = await request.json()
    const db = getDb()

    const updateData: Record<string, any> = {}
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.subject !== undefined) updateData.subject = body.subject
    if (body.name !== undefined) updateData.name = body.name
    if (body.htmlContent !== undefined) updateData.htmlContent = body.htmlContent
    updateData.updatedAt = new Date()

    const [template] = await db
      .update(emailTemplates)
      .set(updateData)
      .where(eq(emailTemplates.id, id))
      .returning()

    if (!template) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ data: template })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

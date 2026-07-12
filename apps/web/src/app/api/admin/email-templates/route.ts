import { NextResponse } from "next/server"
import { getDb, emailTemplates } from "@noticias/database"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const db = getDb()
    const templates = await db.select().from(emailTemplates).orderBy(emailTemplates.id)
    return NextResponse.json({ data: templates })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const db = getDb()
    const [template] = await db
      .insert(emailTemplates)
      .values({
        key: body.key,
        name: body.name,
        subject: body.subject,
        htmlContent: body.htmlContent,
        isActive: body.isActive ?? true,
      })
      .returning()
    return NextResponse.json({ data: template })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { ensureDefaultTemplates } from "@/lib/email"
import { auth } from "@/lib/auth"

export async function POST() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    await ensureDefaultTemplates()
    return NextResponse.json({ message: "Plantillas creadas exitosamente" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

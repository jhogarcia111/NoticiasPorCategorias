import { NextResponse } from "next/server"
import { getDb, passwordResetTokens } from "@noticias/database"
import { eq } from "drizzle-orm"

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token y contraseña requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const db = getDb()
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1)

    if (!resetToken) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }

    if (resetToken.used) {
      return NextResponse.json({ error: "Este enlace ya ha sido utilizado" }, { status: 400 })
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ error: "El enlace ha expirado" }, { status: 400 })
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Configuración de recuperación no disponible" }, { status: 500 })
    }

    const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(resetToken.email)}`, {
      headers: {
        apiKey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })

    const listData = await listResponse.json()
    const users = listData.users || []
    const targetUser = users.find((u: any) => u.email === resetToken.email)

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${targetUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apiKey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ password }),
    })

    if (!updateResponse.ok) {
      const errData = await updateResponse.json()
      return NextResponse.json({ error: errData.msg || "Error al actualizar contraseña" }, { status: 400 })
    }

    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, resetToken.id))

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

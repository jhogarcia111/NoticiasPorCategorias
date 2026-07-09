import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: Request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "userId, currentPassword, newPassword required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const db = (await import("@noticias/database")).getDb()
    const { profiles } = await import("@noticias/database")
    const { eq } = await import("drizzle-orm")
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({ email: profile.id, password: currentPassword }),
    })

    const tokenData = await tokenRes.json()
    if (tokenData.error) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 401 })
    }

    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apiKey: SUPABASE_ANON_KEY || "",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({ password: newPassword }),
    })

    const updateData = await updateRes.json()
    if (updateData.error) {
      return NextResponse.json({ error: updateData.error_description || updateData.msg || "Error al actualizar" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
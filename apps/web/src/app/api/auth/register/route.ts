import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { profiles } from "@noticias/database"

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({
        email,
        password,
        data: { username },
      }),
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error_description || data.msg || "Error al registrar" }, { status: 400 })
    }

    if (data.id) {
      const db = getDb()
      await db.insert(profiles).values({
        id: data.id,
        username: username || email.split("@")[0],
        role: "user",
      })
    }

    return NextResponse.json({ data: { id: data.id, email: data.email } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

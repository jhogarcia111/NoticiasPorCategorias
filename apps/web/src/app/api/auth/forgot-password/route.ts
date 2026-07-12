import { NextResponse } from "next/server"
import { getDb, passwordResetTokens } from "@noticias/database"
import crypto from "crypto"
import { sendTemplateEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 3600000)

    const db = getDb()
    await db.insert(passwordResetTokens).values({ email, token, expiresAt })

    const resetUrl = `${process.env.VITE_APP_URL || "http://localhost:4017"}/reset-password?token=${token}`

    await sendTemplateEmail("reset-password", email, {
      user_name: email.split("@")[0],
      reset_url: resetUrl,
      app_name: "NoticiasPorCategorías",
      app_slogan: "Organiza, categoriza y publica noticias profesionales en LinkedIn",
      app_url: process.env.VITE_APP_URL || "http://localhost:4017",
    })

    return NextResponse.json({ message: "Si el email existe, recibirás un enlace de recuperación" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

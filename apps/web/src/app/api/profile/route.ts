import { NextResponse } from "next/server"
import { getDb, profiles } from "@noticias/database"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  try {
    const db = getDb()
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    return NextResponse.json({ data: profile })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, username, avatarUrl } = await request.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
    const db = getDb()
    const updates: Record<string, any> = { updatedAt: new Date() }
    if (username !== undefined) updates.username = username
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl
    const [profile] = await db.update(profiles).set(updates).where(eq(profiles.id, userId)).returning()
    return NextResponse.json({ data: profile })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { getNewsFromDatabase, markNewsAsProcessed, deleteUserNews, deleteUserNewsByCategory } from "@/services/news-service"
import { auth } from "@/lib/auth"

function requireUserId(session: any): string | null {
  return session?.user?.id || null
}

export async function GET(request: Request) {
  const session = await auth()
  const userId = requireUserId(session)
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("categoryId")
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = parseInt(searchParams.get("offset") || "0")
  const processedParam = searchParams.get("processed")

  if (!userId) return NextResponse.json({ data: [] })

  try {
    const data = await getNewsFromDatabase({
      userId,
      categoryId: categoryId ? parseInt(categoryId) : null,
      limit,
      offset,
      processed: processedParam === "true" ? true : processedParam === "false" ? false : null,
    })
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await auth()
  const userId = requireUserId(session)
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  try {
    const { newsIds } = await request.json()
    if (!newsIds || !Array.isArray(newsIds) || newsIds.length === 0) {
      return NextResponse.json({ error: "newsIds array required" }, { status: 400 })
    }
    await markNewsAsProcessed(newsIds, userId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await auth()
  const userId = requireUserId(session)
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const all = searchParams.get("all")
  const categoryId = searchParams.get("categoryId")

  try {
    if (all === "true") {
      await deleteUserNews(userId)
      return NextResponse.json({ success: true })
    }
    if (categoryId) {
      await deleteUserNewsByCategory(userId, parseInt(categoryId))
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "Specify ?all=true or ?categoryId=X" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
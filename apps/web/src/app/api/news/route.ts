import { NextResponse } from "next/server"
import { getNewsFromDatabase } from "@/services/news-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("categoryId")
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const data = await getNewsFromDatabase({
      categoryId: categoryId ? parseInt(categoryId) : null,
      limit,
      offset,
    })
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

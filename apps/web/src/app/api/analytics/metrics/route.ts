import { NextResponse } from "next/server"
import { getPostMetrics, refreshPostMetrics } from "@/services/analytics-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get("postId")

  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 })

  try {
    const data = await getPostMetrics(parseInt(postId))
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const postId = parseInt(body.postId)
    if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 })

    const data = await refreshPostMetrics(postId)
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import {
  getSchedulingConfigs,
  saveSchedulingConfig,
  getScheduledPosts,
  schedulePost,
  cancelScheduledPost,
} from "@/services/scheduling-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const type = searchParams.get("type") || "configs"

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    if (type === "posts") {
      const filters = {
        status: searchParams.get("status"),
        linkedinProfileId: searchParams.get("linkedinProfileId")
          ? parseInt(searchParams.get("linkedinProfileId")!)
          : undefined,
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      }
      const data = await getScheduledPosts(userId, filters)
      return NextResponse.json({ data })
    }

    const data = await getSchedulingConfigs(userId)
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type } = body

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    if (type === "config") {
      const data = await saveSchedulingConfig(userId, body.linkedinProfileId, body.config)
      return NextResponse.json({ data })
    }

    if (type === "post") {
      const data = await schedulePost(userId, body.postData)
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = parseInt(searchParams.get("postId") || "")

  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 })

  try {
    await cancelScheduledPost(postId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

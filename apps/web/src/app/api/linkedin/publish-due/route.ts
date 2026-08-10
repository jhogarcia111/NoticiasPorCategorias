import { NextResponse } from "next/server"
import { publishDueScheduledPosts, publishScheduledPostById } from "@/services/scheduling-service"

export const maxDuration = 60

export async function GET(request: Request) {
  return handle(request)
}

export async function POST(request: Request) {
  return handle(request)
}

async function handle(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId") ? parseInt(searchParams.get("postId")!) : undefined
    const profileId = searchParams.get("profileId") ? parseInt(searchParams.get("profileId")!) : undefined
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (postId) {
      const result = await publishScheduledPostById(postId)
      return NextResponse.json({ data: [result] })
    }

    const results = await publishDueScheduledPosts(profileId)
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error("publish-due error:", error)
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 })
  }
}
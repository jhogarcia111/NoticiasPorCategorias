import { NextResponse } from "next/server"
import { postToLinkedIn } from "@/services/linkedin-service"

export async function POST(request: Request) {
  try {
    const { profileId, content, title } = await request.json()

    if (!profileId || !content) {
      return NextResponse.json({ error: "profileId and content are required" }, { status: 400 })
    }

    const result = await postToLinkedIn(profileId, content, title)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

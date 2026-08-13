import { NextResponse } from "next/server"
import { getProfileBaseline, captureProfileBaseline } from "@/services/analytics-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get("profileId")

  if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 })

  try {
    const data = await getProfileBaseline(parseInt(profileId))
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const profileId = parseInt(body.profileId)
    if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 })

    const data = await captureProfileBaseline(profileId, body.manual || undefined)
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { getLinkedInProfiles, disconnectLinkedInProfile, saveLinkedInProfile } from "@/services/linkedin-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }

  try {
    const data = await getLinkedInProfiles(userId)
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const profileId = parseInt(searchParams.get("profileId") || "")

  if (!profileId) {
    return NextResponse.json({ error: "profileId required" }, { status: 400 })
  }

  try {
    await disconnectLinkedInProfile(profileId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { code, userId } = await request.json()
    const { exchangeCodeForTokens, getLinkedInProfile } = await import("@/services/linkedin-service")
    const tokens = await exchangeCodeForTokens(code)
    const profileData = await getLinkedInProfile(tokens.access_token)
    const saved = await saveLinkedInProfile(profileData, tokens, userId)

    // Baseline de analíticas: captura el snapshot inicial del perfil
    const { captureProfileBaseline } = await import("@/services/analytics-service")
    let baseline = null
    try {
      baseline = await captureProfileBaseline(saved.id)
    } catch (e) {
      console.error("Baseline capture failed:", e)
    }

    return NextResponse.json({ data: saved, baseline })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

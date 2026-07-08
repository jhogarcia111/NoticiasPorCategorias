import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens, getLinkedInProfile, saveLinkedInProfile } from "@/services/linkedin-service"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const profile = await getLinkedInProfile(tokens.access_token)

    if (!profile.sub) {
      return NextResponse.redirect(new URL("/dashboard?linkedin=error", request.url))
    }

    return NextResponse.redirect(new URL("/dashboard?linkedin=success", request.url))
  } catch (error: any) {
    console.error("LinkedIn callback error:", error)
    return NextResponse.redirect(new URL("/dashboard?linkedin=error", request.url))
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json()
    const tokens = await exchangeCodeForTokens(code)
    const profileData = await getLinkedInProfile(tokens.access_token)
    const saved = await saveLinkedInProfile(profileData, tokens, userId)
    return NextResponse.json({ data: saved })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

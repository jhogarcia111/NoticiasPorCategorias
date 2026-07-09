import { NextResponse } from "next/server"
import { getLinkedInAuthUrl } from "@/services/linkedin-service"

export async function GET() {
  const clientId = process.env.VITE_LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || ""
  const redirectUri = process.env.VITE_LINKEDIN_REDIRECT_URI || process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || ""
  const clientSecret = process.env.VITE_LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_CLIENT_SECRET || ""

  console.log("[LinkedIn Auth] Env check:", {
    clientId: clientId ? `${clientId.substring(0, 5)}...` : "VACIO",
    clientSecret: clientSecret ? "CONFIGURADO" : "VACIO",
    redirectUri: redirectUri || "VACIO",
  })

  const url = getLinkedInAuthUrl()
  return NextResponse.json({ url })
}

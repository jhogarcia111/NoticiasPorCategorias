import { NextResponse } from "next/server"
import { getLinkedInAuthUrl } from "@/services/linkedin-service"

export async function GET() {
  const url = getLinkedInAuthUrl()
  return NextResponse.redirect(url)
}

import { NextResponse } from "next/server"
import { getAnalyticsDashboard } from "@/services/analytics-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    const data = await getAnalyticsDashboard(userId)
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { refreshAllDueMetrics } from "@/services/analytics-service"

export const maxDuration = 60

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const results = await refreshAllDueMetrics()
    return NextResponse.json({ data: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
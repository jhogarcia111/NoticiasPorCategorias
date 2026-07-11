import { NextResponse } from "next/server"
import { getPublishedNewsIds } from "@/services/news-service"

export async function GET() {
  try {
    const ids = await getPublishedNewsIds()
    return NextResponse.json({ data: ids })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

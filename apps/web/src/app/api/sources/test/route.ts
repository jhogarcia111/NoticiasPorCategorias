import { NextResponse } from "next/server"

function stripCDATA(text: string) {
  return text.replace(/<!\[CDATA\[([^\]]*)\]\]>/g, "$1")
}

function extractTagContent(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi")
  const results: string[] = []
  let match
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1].trim())
  }
  return results
}

async function testRSSFeed(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const contentType = res.headers.get("content-type") || ""
  if (!contentType.includes("xml") && !contentType.includes("rss") && !contentType.includes("text/plain") && !contentType.includes("application/octet-stream")) {
    throw new Error(`Tipo de contenido inesperado: ${contentType}`)
  }
  const raw = await res.text()
  const text = stripCDATA(raw)
  const titles = extractTagContent(text, "title")
  const items = Math.max(0, titles.length - 1)
  const firstTitle = titles[0] || "—"
  return { items, feedTitle: firstTitle, contentType, size: raw.length }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 })
    const result = await testRSSFeed(url)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

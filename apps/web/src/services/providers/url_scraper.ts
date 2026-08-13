import type { StandardArticleContext } from "./types"

const MAX_CONTENT_CHARS = 6000

function htmlDecode(text: string): string {
  return text
    .replace(/<!\[CDATA\[([^\]]*)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function getMeta(html: string, prop: string): string {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${prop}["'][^>]*content=["']([^"']+)["']`, "i")
  const m = html.match(pattern)
  return m ? htmlDecode(m[1]) : ""
}

function getMainText(html: string): string {
  let container = ""
  const articleMatch = html.match(/<article[\s>][\s\S]*?<\/article>/i)
  const mainMatch = html.match(/<main[\s>][\s\S]*?<\/main>/i)
  container = (articleMatch?.[0] || mainMatch?.[0] || html) as string

  container = container
    .replace(/<(script|style|noscript|svg|nav|aside|footer|header|form|iframe)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")

  const paragraphs = container
    .match(/<p[^>]*>[\s\S]*?<\/p>/gi)
    ?.map((p) => htmlDecode(p))
    .filter((t) => t.length > 20)

  if (paragraphs && paragraphs.length >= 2) {
    return paragraphs.join("\n").slice(0, MAX_CONTENT_CHARS)
  }

  return htmlDecode(container).slice(0, MAX_CONTENT_CHARS)
}

export async function scrapeUrlContent(url: string): Promise<StandardArticleContext> {
  let parsed: URL
  try {
    parsed = new URL(url)
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("URL inválida")
  } catch {
    throw new Error("URL inválida. Verifica el enlace e inténtalo de nuevo.")
  }

  const res = await fetch(parsed.toString(), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsCurationBot/1.0; +https://noticiasporcategorias.app)" },
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new Error(`No se pudo acceder a la URL (HTTP ${res.status})`)

  const contentType = res.headers.get("content-type") || ""
  const finalUrl = res.url || parsed.toString()

  if (contentType.includes("application/json") || parsed.hostname.includes("api.")) {
    const data = await res.json()
    const title = data.title || data.name || data.heading || "Contenido importado"
    const summary = data.description || data.summary || data.abstract || data.body || ""
    return {
      title: String(title).slice(0, 300),
      summary_raw: String(summary).slice(0, MAX_CONTENT_CHARS),
      source_type: "CUSTOM_URL",
      source_url: finalUrl,
      key_entities: [parsed.hostname.replace(/^www\./, "")],
      category_niche: "General",
      published_at: data.published_at || data.date || new Date(),
      source_name: parsed.hostname.replace(/^www\./, ""),
      language: "es",
    }
  }

  const html = await res.text()

  const title =
    getMeta(html, "og:title") ||
    getMeta(html, "twitter:title") ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
    "Contenido importado"

  const description =
    getMeta(html, "og:description") ||
    getMeta(html, "description") ||
    getMeta(html, "twitter:description") ||
    ""

  const body = getMainText(html)
  const summaryRaw = [description, body].filter(Boolean).join("\n").slice(0, MAX_CONTENT_CHARS)

  return {
    title: htmlDecode(title).slice(0, 300),
    summary_raw: summaryRaw,
    source_type: "CUSTOM_URL",
    source_url: finalUrl,
    key_entities: [parsed.hostname.replace(/^www\./, "")],
    category_niche: "General",
    published_at: new Date(),
    source_name: parsed.hostname.replace(/^www\./, ""),
    language: "es",
  }
}
import type { ContentSourceProvider, StandardArticleContext } from "./types"
import { buildSearchQuery } from "./niche"

const EPO_AUTH_URL = "https://ops.epo.org/3.2/auth/accesstoken"
const EPO_SEARCH_URL = "https://ops.epo.org/3.2/rest-services/published-data/search"

function xmlText(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi")
  const out: string[] = []
  let m
  while ((m = re.exec(xml)) !== null) {
    out.push(m[1].replace(/<[^>]*>/g, "").trim())
  }
  return out
}

function parsePatentDate(raw: string): Date {
  const compact = raw.replace(/[-/]/g, "")
  if (/^\d{8}$/.test(compact)) {
    return new Date(`${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`)
  }
  const d = new Date(raw)
  return isNaN(d.getTime()) ? new Date() : d
}

async function getEpoToken(): Promise<string> {
  const key = process.env.EPO_OPS_CONSUMER_KEY
  const secret = process.env.EPO_OPS_CONSUMER_SECRET
  if (!key || !secret) throw new Error("Falta configurar EPO_OPS_CONSUMER_KEY / EPO_OPS_CONSUMER_SECRET")
  const res = await fetch(EPO_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials`,
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`EPO OPS auth error: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

async function searchEpoOPS(query: string, limit: number): Promise<StandardArticleContext[]> {
  const token = await getEpoToken()
  const params = new URLSearchParams({
    q: `(title=${query}) OR (abstract=${query})`,
    Range: `1-${limit}`,
  })
  const res = await fetch(`${EPO_SEARCH_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/xml",
    },
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new Error(`EPO OPS search error: ${res.status}`)
  const xml = await res.text()

  const docs: StandardArticleContext[] = []
  const docBlocks = xml.split(/<exchange-document[\s>]/).slice(1)
  for (const block of docBlocks) {
    const title = xmlText(block, "invention-title")[0] || ""
    const abstract = xmlText(block, "abstract")[0] || ""
    const country = xmlText(block, "country")[0] || ""
    const docNumber = xmlText(block, "doc-number")[0] || ""
    const pubDate = xmlText(block, "date")[0] || ""
    if (!title && !docNumber) continue
    const pubNumber = `${country}${docNumber}`.trim()
    docs.push({
      title: title || `Patente ${pubNumber}`,
      summary_raw: abstract || "Patente europea publicada. Revisar reivindicaciones principales en el documento original.",
      source_type: "PATENT",
      source_url: `https://worldwide.espacenet.com/searchResults?q=${encodeURIComponent(pubNumber)}`,
      key_entities: [pubNumber].filter(Boolean),
      category_niche: "Ingeniería / Patentes",
      published_at: parsePatentDate(pubDate),
      source_name: "EPO OPS / Espacenet",
      language: "en",
    })
    if (docs.length >= limit) break
  }
  return docs
}

async function searchGooglePatents(query: string, limit: number): Promise<StandardArticleContext[]> {
  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) throw new Error("Falta configurar SERPAPI_KEY para Google Patents")
  const params = new URLSearchParams({
    engine: "google_patents",
    q: query,
    api_key: apiKey,
    num: String(limit),
  })
  const res = await fetch(`https://serpapi.com/search.json?${params}`, { signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new Error(`Google Patents (SerpApi) error: ${res.status}`)
  const data = await res.json()
  const results = data?.organic_results || []

  return results.map((r: any): StandardArticleContext => ({
    title: r.title || "Patente sin título",
    summary_raw: r.snippet || r.description || "Patente publicada en Google Patents.",
    source_type: "PATENT",
    source_url: r.link || `https://patents.google.com/?q=${encodeURIComponent(query)}`,
    key_entities: [r.assignee, r.inventor, r.publication_number].filter(Boolean),
    category_niche: "Ingeniería / Patentes",
    published_at: r.publication_date ? new Date(r.publication_date) : new Date(),
    source_name: "Google Patents",
    language: "en",
  }))
}

export const patentsProvider: ContentSourceProvider = {
  id: "patents",
  name: "Google Patents / EPO OPS",
  sourceType: "PATENT",
  description: "Patentes recientes por palabras clave de nicho (Google Patents vía SerpApi o EPO Open Patent Services)",
  requiresConfig: true,
  missingConfigHint: "Configura SERPAPI_KEY (recomendado) o EPO_OPS_CONSUMER_KEY + EPO_OPS_CONSUMER_SECRET en las variables de entorno.",
  async search(params) {
    const query = buildSearchQuery(params.query, params.niche)
    if (process.env.SERPAPI_KEY) {
      return searchGooglePatents(query, params.limit || 10)
    }
    return searchEpoOPS(query, params.limit || 10)
  },
}
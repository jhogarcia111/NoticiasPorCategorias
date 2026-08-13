import type { ContentSourceProvider, StandardArticleContext } from "./types"
import { buildSearchQuery } from "./niche"

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

interface PubmedSummary {
  title?: string
  pubdate?: string
  source?: string
  articleids?: Array<{ idtype: string; value: string }>
}

async function fetchPubMedIds(query: string, limit: number): Promise<string[]> {
  const params = new URLSearchParams({
    db: "pubmed",
    term: query,
    retmax: String(limit),
    retmode: "json",
    sort: "date",
  })
  const res = await fetch(`${EUTILS_BASE}/esearch.fcgi?${params}`, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`PubMed esearch error: ${res.status}`)
  const data = await res.json()
  return data?.esearchresult?.idlist || []
}

async function fetchPubMedSummaries(ids: string[]): Promise<Record<string, PubmedSummary>> {
  if (ids.length === 0) return {}
  const params = new URLSearchParams({
    db: "pubmed",
    id: ids.join(","),
    retmode: "json",
  })
  const res = await fetch(`${EUTILS_BASE}/esummary.fcgi?${params}`, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`PubMed esummary error: ${res.status}`)
  const data = await res.json()
  return data?.result || {}
}

export async function searchPubMed(query: string, limit = 10): Promise<StandardArticleContext[]> {
  const ids = await fetchPubMedIds(query, limit)
  if (ids.length === 0) return []
  const summaries = await fetchPubMedSummaries(ids)

  const articles: StandardArticleContext[] = []
  for (const id of ids) {
    const s = summaries[id]
    if (!s || !s.title) continue
    const doi = s.articleids?.find((a) => a.idtype === "doi")?.value
    const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${id}/`
    articles.push({
      title: stripTags(s.title),
      summary_raw: `Artículo indexado en PubMed (PMID ${id}). Publicado en: ${s.source || "revista no especificada"}. Fuente: ${pubmedUrl}${doi ? ` DOI: https://doi.org/${doi}` : ""}`,
      source_type: "SCIENTIFIC",
      source_url: doi ? `https://doi.org/${doi}` : pubmedUrl,
      key_entities: ["PubMed", s.source || "Publicación científica"],
      category_niche: "Salud / Biomédica / Química",
      published_at: s.pubdate ? new Date(s.pubdate) : new Date(),
      source_name: "PubMed",
      language: "en",
    })
  }
  return articles
}

async function searchClinicalTrials(query: string, limit: number): Promise<StandardArticleContext[]> {
  const params = new URLSearchParams({
    "query.term": query,
    pageSize: String(limit),
    fields: "NCTId,BriefTitle,OfficialTitle,BriefSummary,OverallStatus,Phase,StartDate,PrimaryCompletionDate,Condition,LeadSponsorName",
  })
  const res = await fetch(`https://clinicaltrials.gov/api/v2/studies?${params.toString()}`, {
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`ClinicalTrials.gov error: ${res.status}`)
  const data = await res.json()
  const studies = data?.studies || []

  return studies
    .filter((st: any) => {
      const mod = st?.protocolSection?.statusModule
      const status = mod?.overallStatus?.toLowerCase()
      return !status || status === "completed" || status === "recruiting"
    })
    .map((st: any): StandardArticleContext => {
      const ps = st?.protocolSection || {}
      const ident = ps.identificationModule || {}
      const status = ps.statusModule || {}
      const desc = ps.descriptionModule || {}
      const cond = ps.conditionsModule?.conditions || []
      const sponsor = ps.sponsorCollaboratorsModule?.leadSponsor?.name || ""
      const url = `https://clinicaltrials.gov/study/${ident.nctId}`
      return {
        title: ident.briefTitle || ident.officialTitle || "Estudio clínico sin título",
        summary_raw: desc.briefSummary || `Estudio clínico ${ident.nctId}. Estado: ${status.overallStatus || "no especificado"}.`,
        source_type: "SCIENTIFIC",
        source_url: url,
        key_entities: [...cond, sponsor].filter(Boolean),
        category_niche: "Salud / Biomédica / Química",
        published_at: status.startDateStruct?.date || new Date(),
        source_name: "ClinicalTrials.gov",
        language: "en",
      }
    })
}

export const pubmedProvider: ContentSourceProvider = {
  id: "pubmed",
  name: "PubMed / NCBI Entrez",
  sourceType: "SCIENTIFIC",
  description: "Artículos científicos indexados en PubMed por palabras clave de nicho",
  requiresConfig: false,
  async search(params) {
    const query = buildSearchQuery(params.query, params.niche)
    return searchPubMed(query, params.limit || 10)
  },
}

export const clinicaltrialsProvider: ContentSourceProvider = {
  id: "clinicaltrials",
  name: "ClinicalTrials.gov",
  sourceType: "SCIENTIFIC",
  description: "Estudios clínicos completados o con hallazgos recientes según el nicho",
  requiresConfig: false,
  async search(params) {
    const query = buildSearchQuery(params.query, params.niche)
    return searchClinicalTrials(query, params.limit || 10)
  },
}
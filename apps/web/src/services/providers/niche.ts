import type { Niche } from "./types"

const NICHE_KEYWORDS: Record<Niche, string[]> = {
  health: ["clinical trial", "medical", "therapy", "biomedical", "drug", "disease"],
  tech: ["technology", "innovation", "software", "AI", "hardware", "digital"],
  business: ["market", "startup", "company", "industry", "investment", "enterprise"],
  engineering: ["engineering", "mechanical", "electrical", "manufacturing", "design"],
  astronomy: ["space", "astronomy", "astrophysics", "cosmos", "telescope", "planet"],
  earth: ["geology", "earth", "geophysics", "tectonic", "volcano", "seismic"],
  environment: ["climate", "environment", "sustainability", "carbon", "ecosystem", "renewable"],
  archaeology: ["archaeology", "artifact", "ancient", "excavation", "fossil", "historical"],
  general: [],
}

const NICHE_LABELS: Record<Niche, string> = {
  health: "Salud / Biomédica / Química",
  tech: "Tecnología / Empresas",
  business: "Negocios / Mercado",
  engineering: "Ingeniería / Patentes",
  astronomy: "Astronomía / Espacio",
  earth: "Ciencias de la Tierra",
  environment: "Medio Ambiente",
  archaeology: "Arqueología / Historia",
  general: "General",
}

export function detectNiche(categoryName: string): Niche {
  const name = categoryName.toLowerCase()
  const rules: Array<[Niche, string[]]> = [
    ["health", ["salud", "medic", "salud", "biomed", "farma", "quimic", "health", "medical", "clinical", "bio"]],
    ["tech", ["tecnolog", "tech", "software", "informatic", "digital", "ai", "inteligencia"]],
    ["business", ["negocio", "empresa", "finanz", "econom", "business", "market", "startup"]],
    ["engineering", ["ingenier", "engineering", "patent", "manufactur"]],
    ["astronomy", ["astronom", "espacio", "space", "astrophysic", "cosmos"]],
    ["earth", ["tierra", "geolog", "earth", "geophysic", "volcan", "sismic"]],
    ["environment", ["ambient", "clima", "environment", "climate", "ecolog", "sostenib"]],
    ["archaeology", ["arqueolog", "archaeolog", "histori", "ancient", "fosil"]],
  ]
  for (const [niche, keywords] of rules) {
    if (keywords.some((k) => name.includes(k))) return niche
  }
  return "general"
}

export function getNicheLabel(niche: Niche): string {
  return NICHE_LABELS[niche] || niche
}

export function buildSearchQuery(query: string, niche?: string): string {
  const keywords = niche ? NICHE_KEYWORDS[niche as Niche] || [] : []
  const parts = [query.trim()]
  if (keywords.length > 0) {
    const mapped = keywords.slice(0, 3).map((k) => `(${k})`)
    parts.push(mapped.join(" OR "))
  }
  return parts.filter(Boolean).join(" AND ")
}
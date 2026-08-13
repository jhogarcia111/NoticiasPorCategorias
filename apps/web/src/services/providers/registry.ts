import type { ContentSourceProvider, StandardArticleContext } from "./types"
import { pubmedProvider, clinicaltrialsProvider } from "./pubmed"
import { patentsProvider } from "./patents"

export const contentSourceProviders: ContentSourceProvider[] = [
  pubmedProvider,
  clinicaltrialsProvider,
  patentsProvider,
]

export function getProvider(id: string): ContentSourceProvider | undefined {
  return contentSourceProviders.find((p) => p.id === id)
}

export async function searchScientific(query: string, niche?: string, limit?: number): Promise<{ results: StandardArticleContext[]; errors: string[] }> {
  const results: StandardArticleContext[] = []
  const errors: string[] = []
  for (const provider of [pubmedProvider, clinicaltrialsProvider]) {
    try {
      results.push(...(await provider.search({ query, niche, limit })))
    } catch (e: any) {
      errors.push(`${provider.name}: ${e.message}`)
    }
  }
  return { results, errors }
}

export async function searchPatents(query: string, niche?: string, limit?: number): Promise<{ results: StandardArticleContext[]; errors: string[] }> {
  const results: StandardArticleContext[] = []
  const errors: string[] = []
  try {
    results.push(...(await patentsProvider.search({ query, niche, limit })))
  } catch (e: any) {
    errors.push(`${patentsProvider.name}: ${e.message}`)
  }
  return { results, errors }
}

export function providerStatus(): { id: string; name: string; requiresConfig: boolean; configured: boolean; hint?: string }[] {
  return contentSourceProviders.map((p) => {
    let configured = true
    if (p.id === "patents") {
      configured = Boolean(process.env.SERPAPI_KEY || (process.env.EPO_OPS_CONSUMER_KEY && process.env.EPO_OPS_CONSUMER_SECRET))
    }
    return {
      id: p.id,
      name: p.name,
      requiresConfig: p.requiresConfig,
      configured,
      hint: p.requiresConfig && !configured ? p.missingConfigHint : undefined,
    }
  })
}
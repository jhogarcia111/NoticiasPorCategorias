export type SourceType = "NEWS" | "SCIENTIFIC" | "PATENT" | "CUSTOM_URL"

export type Niche =
  | "health"
  | "tech"
  | "business"
  | "engineering"
  | "astronomy"
  | "earth"
  | "environment"
  | "archaeology"
  | "general"

export interface StandardArticleContext {
  title: string
  summary_raw: string
  source_type: SourceType
  source_url: string
  key_entities: string[]
  category_niche: string
  published_at?: string | Date | null
  image_url?: string | null
  source_name?: string
  language?: string
}

export interface ProviderSearchParams {
  query: string
  niche?: string
  limit?: number
}

export interface ContentSourceProvider {
  id: string
  name: string
  sourceType: SourceType
  description: string
  requiresConfig: boolean
  missingConfigHint?: string
  search(params: ProviderSearchParams): Promise<StandardArticleContext[]>
}
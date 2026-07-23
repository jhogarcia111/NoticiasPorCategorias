export const PLAN_LIMITS: Record<string, { postsPerMonth: number; charsPerPost: number }> = {
  free: { postsPerMonth: 1, charsPerPost: 200 },
  pioneer_cofounder: { postsPerMonth: 5, charsPerPost: 5000 },
  pro: { postsPerMonth: Infinity, charsPerPost: Infinity },
  business: { postsPerMonth: Infinity, charsPerPost: Infinity },
}

export function getPlanLimits(slug?: string | null) {
  return PLAN_LIMITS[slug || ""] || PLAN_LIMITS.free
}
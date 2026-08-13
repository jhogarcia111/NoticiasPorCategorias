"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export function useAnalyticsDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ["analytics-dashboard", userId],
    queryFn: () => fetchJson(`/api/analytics?userId=${userId}`),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}

export function useProfileBaseline(profileId?: number) {
  return useQuery({
    queryKey: ["analytics-baseline", profileId],
    queryFn: () => fetchJson(`/api/analytics/baseline?profileId=${profileId}`),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useUpdateBaseline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, manual }: { profileId: number; manual?: any }) =>
      fetchJson("/api/analytics/baseline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, manual }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-baseline"] })
      queryClient.invalidateQueries({ queryKey: ["analytics-dashboard"] })
    },
  })
}

export function useRefreshPostMetrics() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: number) =>
      fetchJson("/api/analytics/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-dashboard"] })
    },
  })
}
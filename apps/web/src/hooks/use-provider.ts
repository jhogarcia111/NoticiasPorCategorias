"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export function useProviderStatus() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchJson("/api/providers"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useCollectFromProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      source: "scientific" | "patents" | "url"
      categoryId?: number | null
      query?: string
      url?: string
      niche?: string
      limit?: number
    }) =>
      fetchJson("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }),
    onSuccess: (data) => {
      const inserted = data?.data?.inserted || []
      if (inserted.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["news"] })
      }
    },
  })
}
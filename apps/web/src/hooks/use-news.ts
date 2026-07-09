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

export function useNews(options: {
  categoryId?: number | null
  limit?: number
  offset?: number
  processed?: boolean | null
} = {}) {
  const { categoryId = null, limit = 20, offset = 0, processed } = options
  const params = new URLSearchParams()
  if (categoryId) params.set("categoryId", String(categoryId))
  params.set("limit", String(limit))
  params.set("offset", String(offset))
  if (processed !== undefined && processed !== null) {
    params.set("processed", String(processed))
  }

  return useQuery({
    queryKey: ["news", { categoryId, limit, offset, processed }],
    queryFn: () => fetchJson(`/api/news?${params}`),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useCollectNews() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params?: { categoryId?: number; categoryIds?: number[]; query?: string }) =>
      fetchJson("/api/news/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params || {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] })
    },
  })
}

export function useMarkNewsAsProcessed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newsIds: number[]) =>
      fetchJson("/api/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] })
    },
  })
}

export function useDeleteAllNews() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => fetchJson("/api/news?all=true", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] })
    },
  })
}

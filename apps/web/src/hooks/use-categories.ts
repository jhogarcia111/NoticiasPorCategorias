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

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchJson("/api/categories").then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  })
}

export function useToggleCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      fetchJson("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["news"] })
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string; newsapiCategory?: string; query?: string }) =>
      fetchJson("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

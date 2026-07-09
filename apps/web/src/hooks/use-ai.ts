"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export function useGenerateSummary() {
  return useMutation({
    mutationFn: ({ content, options }: { content: string; options?: any }) =>
      fetchJson("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "summary", content, options }),
      }),
  })
}

export function useGenerateImagePrompt() {
  return useMutation({
    mutationFn: ({ title, summary }: { title: string; summary: string }) =>
      fetchJson("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "image-prompt", title, summary }),
      }),
  })
}

export function useGenerateLinkedInPost() {
  return useMutation({
    mutationFn: ({ newsItems, options }: { newsItems: any[]; options?: any }) =>
      fetchJson("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "linkedin-post", newsItems, options }),
      }),
  })
}

export function useGenerateHashtags() {
  return useMutation({
    mutationFn: ({ title, summary }: { title: string; summary: string }) =>
      fetchJson("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "hashtags", title, summary }),
      }),
  })
}

export function useProcessNewsWithAI() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newsId: number) =>
      fetchJson("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "process-news", newsId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] })
    },
  })
}

export function useProcessMultipleNewsWithAI() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newsIds: number[]) =>
      fetchJson("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "process-multiple", newsIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] })
    },
  })
}

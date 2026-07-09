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

export function useProfile(userId?: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchJson(`/api/profile?userId=${userId}`).then((r) => r.data),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { userId: string; username?: string; avatarUrl?: string }) =>
      fetchJson("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { userId: string; currentPassword: string; newPassword: string }) =>
      fetchJson("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  })
}
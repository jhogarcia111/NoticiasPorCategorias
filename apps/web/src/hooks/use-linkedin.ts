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

export function useLinkedInProfiles() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ["linkedin-profiles", userId],
    queryFn: () => fetchJson(`/api/linkedin/profiles?userId=${userId}`),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useConnectLinkedIn() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const result = await fetchJson("/api/linkedin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userId }),
      })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin-profiles"] })
    },
  })
}

export function useDisconnectLinkedIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (profileId: number) =>
      fetchJson(`/api/linkedin/profiles?profileId=${profileId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin-profiles"] })
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] })
    },
  })
}

export function useLinkedInAuth() {
  const connectMutation = useConnectLinkedIn()

  const connectProfile = () => {
    window.location.href = "/api/linkedin/auth-url"
  }

  const handleAuthCallback = async (code: string) => {
    try {
      await connectMutation.mutateAsync({ code })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    connectProfile,
    handleAuthCallback,
    isConnecting: connectMutation.isPending,
    error: connectMutation.error,
  }
}

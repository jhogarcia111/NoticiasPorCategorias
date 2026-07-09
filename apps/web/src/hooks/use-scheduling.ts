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

export function useScheduling() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  const configsQuery = useQuery({
    queryKey: ["scheduling-configs", userId],
    queryFn: () => fetchJson(`/api/scheduling?userId=${userId}&type=configs`),
    enabled: !!userId,
    retry: 1,
  })

  const postsQuery = useQuery({
    queryKey: ["scheduled-posts", userId],
    queryFn: () => fetchJson(`/api/scheduling?userId=${userId}&type=posts`),
    enabled: !!userId,
    retry: 1,
  })

  const saveConfigMutation = useMutation({
    mutationFn: ({ linkedinProfileId, config }: { linkedinProfileId: number; config: any }) =>
      fetchJson("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "config", linkedinProfileId, config }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduling-configs", userId] })
    },
  })

  const schedulePostMutation = useMutation({
    mutationFn: (postData: any) =>
      fetchJson("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "post", postData }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts", userId] })
    },
  })

  const scheduleMultipleMutation = useMutation({
    mutationFn: ({ linkedinProfileId, newsItems, config }: { linkedinProfileId: number; newsItems: any[]; config: any }) =>
      fetchJson("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "schedule-multiple", linkedinProfileId, newsItems, config }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts", userId] })
    },
  })

  const cancelPostMutation = useMutation({
    mutationFn: (postId: number) =>
      fetchJson("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "cancel", postId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts", userId] })
    },
  })

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) =>
      fetchJson(`/api/scheduling?postId=${postId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts", userId] })
    },
  })

  const configs = configsQuery.data?.data || []
  const scheduledPosts = postsQuery.data?.data || []

  const stats = {
    total: scheduledPosts.length,
    scheduled: scheduledPosts.filter((p: any) => p.status === "scheduled").length,
    published: scheduledPosts.filter((p: any) => p.status === "published").length,
    failed: scheduledPosts.filter((p: any) => p.status === "failed").length,
    cancelled: scheduledPosts.filter((p: any) => p.status === "cancelled").length,
  }

  return {
    configs,
    scheduledPosts,
    configsLoading: configsQuery.isLoading,
    postsLoading: postsQuery.isLoading,
    isLoading: configsQuery.isLoading || postsQuery.isLoading,
    configsError: configsQuery.error,
    postsError: postsQuery.error,
    error: configsQuery.error || postsQuery.error,
    saveConfig: saveConfigMutation.mutateAsync,
    schedulePost: schedulePostMutation.mutateAsync,
    scheduleMultiplePosts: scheduleMultipleMutation.mutateAsync,
    cancelPost: cancelPostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    isSaving: saveConfigMutation.isPending,
    isScheduling: schedulePostMutation.isPending,
    isSchedulingMultiple: scheduleMultipleMutation.isPending,
    isCancelling: cancelPostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    stats,
  }
}

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schedulingService } from '../services/schedulingService'
import { useAuth } from '../contexts/AuthContext'

export const useScheduling = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Obtener configuraciones de programación
  const {
    data: configs,
    isLoading: configsLoading,
    error: configsError
  } = useQuery({
    queryKey: ['scheduling-configs', user?.id],
    queryFn: () => schedulingService.getSchedulingConfigs(user.id),
    enabled: !!user?.id,
    select: (result) => result.data || []
  })

  // Obtener posts programados
  const {
    data: scheduledPosts,
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ['scheduled-posts', user?.id],
    queryFn: () => schedulingService.getScheduledPosts(user.id),
    enabled: !!user?.id,
    select: (result) => result.data || []
  })

  // Mutación para guardar configuración
  const saveConfigMutation = useMutation({
    mutationFn: ({ linkedinProfileId, config }) => 
      schedulingService.saveSchedulingConfig(user.id, linkedinProfileId, config),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduling-configs', user?.id])
    }
  })

  // Mutación para programar post
  const schedulePostMutation = useMutation({
    mutationFn: (postData) => schedulingService.schedulePost(user.id, postData),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduled-posts', user?.id])
    }
  })

  // Mutación para programar múltiples posts
  const scheduleMultipleMutation = useMutation({
    mutationFn: ({ linkedinProfileId, newsItems, config }) => 
      schedulingService.scheduleMultiplePosts(user.id, linkedinProfileId, newsItems, config),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduled-posts', user?.id])
    }
  })

  // Mutación para actualizar post programado
  const updatePostMutation = useMutation({
    mutationFn: ({ postId, updates }) => 
      schedulingService.updateScheduledPost(postId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduled-posts', user?.id])
    }
  })

  // Mutación para cancelar post
  const cancelPostMutation = useMutation({
    mutationFn: (postId) => schedulingService.cancelScheduledPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduled-posts', user?.id])
    }
  })

  // Mutación para eliminar post
  const deletePostMutation = useMutation({
    mutationFn: (postId) => schedulingService.deleteScheduledPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduled-posts', user?.id])
    }
  })

  // Funciones helper
  const saveConfig = async (linkedinProfileId, config) => {
    return saveConfigMutation.mutateAsync({ linkedinProfileId, config })
  }

  const schedulePost = async (postData) => {
    return schedulePostMutation.mutateAsync(postData)
  }

  const scheduleMultiplePosts = async (linkedinProfileId, newsItems, config) => {
    return scheduleMultipleMutation.mutateAsync({ linkedinProfileId, newsItems, config })
  }

  const updatePost = async (postId, updates) => {
    return updatePostMutation.mutateAsync({ postId, updates })
  }

  const cancelPost = async (postId) => {
    return cancelPostMutation.mutateAsync(postId)
  }

  const deletePost = async (postId) => {
    return deletePostMutation.mutateAsync(postId)
  }

  // Estadísticas
  const stats = {
    total: scheduledPosts?.length || 0,
    scheduled: scheduledPosts?.filter(post => post.status === 'scheduled').length || 0,
    published: scheduledPosts?.filter(post => post.status === 'published').length || 0,
    failed: scheduledPosts?.filter(post => post.status === 'failed').length || 0,
    cancelled: scheduledPosts?.filter(post => post.status === 'cancelled').length || 0
  }

  return {
    // Datos
    configs,
    scheduledPosts,
    
    // Estados de carga
    configsLoading,
    postsLoading,
    isLoading: configsLoading || postsLoading,
    
    // Errores
    configsError,
    postsError,
    error: configsError || postsError,
    
    // Mutaciones
    saveConfig,
    schedulePost,
    scheduleMultiplePosts,
    updatePost,
    cancelPost,
    deletePost,
    
    // Estados de mutaciones
    isSaving: saveConfigMutation.isPending,
    isScheduling: schedulePostMutation.isPending,
    isSchedulingMultiple: scheduleMultipleMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isCancelling: cancelPostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    
    // Estadísticas
    stats
  }
}

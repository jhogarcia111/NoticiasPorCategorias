import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLinkedInProfiles,
  saveLinkedInProfile,
  publishToLinkedIn,
  disconnectLinkedInProfile,
  getLinkedInAuthUrl,
  exchangeCodeForTokens,
  getLinkedInProfile,
  getLinkedInEmail
} from '../services/linkedinService'

// Hook para obtener perfiles de LinkedIn
export const useLinkedInProfiles = () => {
  return useQuery({
    queryKey: ['linkedin-profiles'],
    queryFn: getLinkedInProfiles,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  })
}

// Hook para conectar perfil de LinkedIn
export const useConnectLinkedIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ code }) => {
      // Intercambiar código por tokens usando proxy
      const tokens = await exchangeCodeForTokens(code)
      
      // Obtener información del perfil usando proxy
      const [profile, email] = await Promise.all([
        getLinkedInProfile(tokens.access_token),
        getLinkedInEmail(tokens.access_token)
      ])

      // Combinar datos del perfil
      const profileData = {
        ...profile,
        email
      }

      // Guardar en la base de datos
      console.log('LinkedIn Hook: About to save profile to database...')
      const result = await saveLinkedInProfile(profileData, tokens)
      console.log('LinkedIn Hook: Profile saved successfully:', result)
      return result
    },
    onSuccess: (data) => {
      console.log('LinkedIn Hook: Connection successful, invalidating queries...')
      queryClient.invalidateQueries({ queryKey: ['linkedin-profiles'] })
      console.log('LinkedIn Hook: Queries invalidated successfully')
    },
    onError: (error) => {
      console.error('LinkedIn Hook: Error connecting LinkedIn profile:', error)
    }
  })
}

// Hook para publicar en LinkedIn
export const usePublishToLinkedIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ profileId, content }) => publishToLinkedIn(profileId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] })
    },
    onError: (error) => {
      console.error('Error publishing to LinkedIn:', error)
    }
  })
}

// Hook para desconectar perfil de LinkedIn
export const useDisconnectLinkedIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: disconnectLinkedInProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] })
    },
    onError: (error) => {
      console.error('Error disconnecting LinkedIn profile:', error)
    }
  })
}

// Hook para manejar la autenticación de LinkedIn
export const useLinkedInAuth = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const connectMutation = useConnectLinkedIn()

  const connectProfile = () => {
    setIsConnecting(true)
    const authUrl = getLinkedInAuthUrl()
    window.location.href = authUrl
  }

  const handleAuthCallback = async (code) => {
    try {
      await connectMutation.mutateAsync({ code })
      setIsConnecting(false)
      return { success: true }
    } catch (error) {
      setIsConnecting(false)
      return { success: false, error: error.message }
    }
  }

  return {
    connectProfile,
    handleAuthCallback,
    isConnecting: isConnecting || connectMutation.isPending,
    error: connectMutation.error
  }
}

// Hook para verificar si hay código de autorización en la URL
export const useLinkedInCallback = () => {
  const { handleAuthCallback } = useLinkedInAuth()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (code) {
      handleAuthCallback(code).then((result) => {
        if (result.success) {
          // Limpiar URL y mostrar mensaje de éxito
          window.history.replaceState({}, document.title, window.location.pathname)
          // Aquí podrías mostrar una notificación de éxito
        } else {
          // Mostrar error
          console.error('LinkedIn connection failed:', result.error)
        }
      })
    } else if (error) {
      console.error('LinkedIn authorization error:', error)
    }
  }, [handleAuthCallback])
}

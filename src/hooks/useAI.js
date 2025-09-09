import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  generateNewsSummary,
  generateImagePrompt,
  generateLinkedInPost,
  processNewsWithAI,
  processMultipleNewsWithAI,
  generateHashtags
} from '../services/aiService'

// Hook para generar resumen de noticia
export const useGenerateSummary = () => {
  return useMutation({
    mutationFn: ({ content, options }) => generateNewsSummary(content, options),
    onError: (error) => {
      console.error('Error generating summary:', error)
    }
  })
}

// Hook para generar prompt de imagen
export const useGenerateImagePrompt = () => {
  return useMutation({
    mutationFn: ({ title, summary }) => generateImagePrompt(title, summary),
    onError: (error) => {
      console.error('Error generating image prompt:', error)
    }
  })
}

// Hook para generar post de LinkedIn
export const useGenerateLinkedInPost = () => {
  return useMutation({
    mutationFn: ({ newsItems, options }) => generateLinkedInPost(newsItems, options),
    onError: (error) => {
      console.error('Error generating LinkedIn post:', error)
    }
  })
}

// Hook para procesar noticia con IA
export const useProcessNewsWithAI = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: processNewsWithAI,
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['news'] })
      console.log('News processed with AI:', data)
    },
    onError: (error) => {
      console.error('Error processing news with AI:', error)
    }
  })
}

// Hook para procesar múltiples noticias con IA
export const useProcessMultipleNewsWithAI = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: processMultipleNewsWithAI,
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['news'] })
      console.log('Multiple news processed with AI:', data)
    },
    onError: (error) => {
      console.error('Error processing multiple news with AI:', error)
    }
  })
}

// Hook para generar hashtags
export const useGenerateHashtags = () => {
  return useMutation({
    mutationFn: ({ title, summary }) => generateHashtags(title, summary),
    onError: (error) => {
      console.error('Error generating hashtags:', error)
    }
  })
}

// Hook personalizado para gestión de IA
export const useAIManagement = () => {
  const generateSummaryMutation = useGenerateSummary()
  const generateImagePromptMutation = useGenerateImagePrompt()
  const generateLinkedInPostMutation = useGenerateLinkedInPost()
  const processNewsMutation = useProcessNewsWithAI()
  const processMultipleNewsMutation = useProcessMultipleNewsWithAI()
  const generateHashtagsMutation = useGenerateHashtags()

  const processNews = async (newsId) => {
    try {
      return await processNewsMutation.mutateAsync(newsId)
    } catch (error) {
      console.error('Error processing news:', error)
      throw error
    }
  }

  const processMultipleNews = async (newsIds) => {
    try {
      return await processMultipleNewsMutation.mutateAsync(newsIds)
    } catch (error) {
      console.error('Error processing multiple news:', error)
      throw error
    }
  }

  const generateSummary = async (content, options = {}) => {
    try {
      return await generateSummaryMutation.mutateAsync({ content, options })
    } catch (error) {
      console.error('Error generating summary:', error)
      throw error
    }
  }

  const generateImagePrompt = async (title, summary) => {
    try {
      return await generateImagePromptMutation.mutateAsync({ title, summary })
    } catch (error) {
      console.error('Error generating image prompt:', error)
      throw error
    }
  }

  const generateLinkedInPost = async (newsItems, options = {}) => {
    try {
      return await generateLinkedInPostMutation.mutateAsync({ newsItems, options })
    } catch (error) {
      console.error('Error generating LinkedIn post:', error)
      throw error
    }
  }

  const generateHashtags = async (title, summary) => {
    try {
      return await generateHashtagsMutation.mutateAsync({ title, summary })
    } catch (error) {
      console.error('Error generating hashtags:', error)
      throw error
    }
  }

  return {
    // Actions
    processNews,
    processMultipleNews,
    generateSummary,
    generateImagePrompt,
    generateLinkedInPost,
    generateHashtags,

    // Loading states
    isProcessing: processNewsMutation.isPending,
    isProcessingMultiple: processMultipleNewsMutation.isPending,
    isGeneratingSummary: generateSummaryMutation.isPending,
    isGeneratingImagePrompt: generateImagePromptMutation.isPending,
    isGeneratingPost: generateLinkedInPostMutation.isPending,
    isGeneratingHashtags: generateHashtagsMutation.isPending,

    // Errors
    processError: processNewsMutation.error,
    processMultipleError: processMultipleNewsMutation.error,
    summaryError: generateSummaryMutation.error,
    imagePromptError: generateImagePromptMutation.error,
    postError: generateLinkedInPostMutation.error,
    hashtagsError: generateHashtagsMutation.error
  }
}

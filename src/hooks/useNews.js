import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  fetchNewsFromAPI, 
  searchNews, 
  processAndSaveNews, 
  collectNewsForAllCategories,
  getNewsFromDatabase,
  markNewsAsProcessed,
  deleteAllNews
} from '../services/newsService'

// Hook para obtener noticias de la base de datos
export const useNews = (options = {}) => {
  const {
    categoryId = null,
    limit = 20,
    offset = 0,
    processed = true,
    language = 'es'
  } = options

  return useQuery({
    queryKey: ['news', { categoryId, limit, offset, processed, language }],
    queryFn: () => getNewsFromDatabase({ categoryId, limit, offset, processed, language }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  })
}

// Hook para buscar noticias en NewsAPI
export const useNewsSearch = (query, options = {}) => {
  return useQuery({
    queryKey: ['newsSearch', query, options],
    queryFn: () => searchNews(query, options),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1
  })
}

// Hook para obtener noticias por categoría desde NewsAPI
export const useNewsByCategory = (category, options = {}) => {
  return useQuery({
    queryKey: ['newsByCategory', category, options],
    queryFn: () => fetchNewsFromAPI({ category, ...options }),
    enabled: !!category,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1
  })
}

// Hook para recolectar noticias (mutación)
export const useCollectNews = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: collectNewsForAllCategories,
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['news'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      
      console.log('News collection completed:', data)
    },
    onError: (error) => {
      console.error('Error collecting news:', error)
    }
  })
}

// Hook para procesar y guardar noticias
export const useProcessNews = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ articles, categoryId }) => processAndSaveNews(articles, categoryId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      console.log('News processed and saved:', data.length)
    },
    onError: (error) => {
      console.error('Error processing news:', error)
    }
  })
}

// Hook para marcar noticias como procesadas
export const useMarkNewsAsProcessed = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNewsAsProcessed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (error) => {
      console.error('Error marking news as processed:', error)
    }
  })
}

// Hook para borrar todas las noticias (SOLO PARA PRUEBAS)
export const useDeleteAllNews = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAllNews,
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con noticias
      queryClient.invalidateQueries({ queryKey: ['news'] })
      queryClient.invalidateQueries({ queryKey: ['newsStats'] })
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] })
      
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: ['news'] })
      
      console.log('Todas las noticias han sido borradas')
    },
    onError: (error) => {
      console.error('Error deleting all news:', error)
    }
  })
}

// Hook para estadísticas de noticias
export const useNewsStats = () => {
  return useQuery({
    queryKey: ['newsStats'],
    queryFn: async () => {
      const [totalNews, processedNews, unprocessedNews] = await Promise.all([
        getNewsFromDatabase({ limit: 1, processed: null }).then(data => data.length),
        getNewsFromDatabase({ limit: 1, processed: true }).then(data => data.length),
        getNewsFromDatabase({ limit: 1, processed: false }).then(data => data.length)
      ])

      return {
        total: totalNews,
        processed: processedNews,
        unprocessed: unprocessedNews,
        processingRate: totalNews > 0 ? (processedNews / totalNews) * 100 : 0
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1
  })
}

// Hook personalizado para gestión de noticias
export const useNewsManagement = () => {
  const [selectedNews, setSelectedNews] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  const { data: news, isLoading, error } = useNews({
    categoryId: selectedCategory,
    limit: 50,
    processed: null, // Mostrar todas las noticias (procesadas y no procesadas)
    language: localStorage.getItem('app_language') || 'es'
  })

  const { data: searchResults, isLoading: isSearching } = useNewsSearch(searchQuery)
  const collectNewsMutation = useCollectNews()
  const processNewsMutation = useProcessNews()
  const markProcessedMutation = useMarkNewsAsProcessed()

  // Filtrar noticias por búsqueda
  const filteredNews = React.useMemo(() => {
    if (!news) return []
    
    if (!searchQuery || searchQuery.trim() === '') {
      return news
    }
    
    const query = searchQuery.toLowerCase().trim()
    return news.filter(item => 
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.source_name?.toLowerCase().includes(query)
    )
  }, [news, searchQuery])

  const handleSelectNews = (newsItem) => {
    setSelectedNews(prev => {
      const exists = prev.find(item => item.id === newsItem.id)
      if (exists) {
        return prev.filter(item => item.id !== newsItem.id)
      } else {
        return [...prev, newsItem]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedNews.length === news?.length) {
      setSelectedNews([])
    } else {
      setSelectedNews(news || [])
    }
  }

  const handleCollectNews = async () => {
    try {
      const result = await collectNewsMutation.mutateAsync()
      return result
    } catch (error) {
      console.error('Error collecting news:', error)
      throw error
    }
  }

  const handleMarkAsProcessed = async () => {
    if (selectedNews.length === 0) return

    try {
      const newsIds = selectedNews.map(item => item.id)
      await markProcessedMutation.mutateAsync(newsIds)
      setSelectedNews([])
    } catch (error) {
      console.error('Error marking news as processed:', error)
    }
  }

  return {
    // Data
    news: filteredNews, // Usar noticias filtradas
    searchResults,
    selectedNews,
    searchQuery,
    selectedCategory,
    
    // Loading states
    isLoading,
    isSearching,
    isCollecting: collectNewsMutation.isPending,
    isProcessing: processNewsMutation.isPending,
    isMarking: markProcessedMutation.isPending,
    
    // Errors
    error,
    collectError: collectNewsMutation.error,
    processError: processNewsMutation.error,
    
    // Actions
    setSearchQuery,
    setSelectedCategory,
    handleSelectNews,
    handleSelectAll,
    handleCollectNews,
    handleMarkAsProcessed,
    
    // Stats
    selectedCount: selectedNews.length,
    totalCount: filteredNews?.length || 0
  }
}

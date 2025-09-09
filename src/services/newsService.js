import { supabase } from './supabase'
import { 
  generateNewsSummary, 
  generateLinkedInPost, 
  generateHashtags, 
  generateImagePrompt 
} from './aiService'

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2'
const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY

// Categorías disponibles en NewsAPI
export const NEWSAPI_CATEGORIES = {
  'business': 'Negocios',
  'entertainment': 'Entretenimiento',
  'general': 'General',
  'health': 'Salud',
  'science': 'Ciencia',
  'sports': 'Deportes',
  'technology': 'Tecnología'
}

// Países disponibles
export const NEWSAPI_COUNTRIES = {
  'us': 'Estados Unidos',
  'mx': 'México',
  'ar': 'Argentina',
  'co': 'Colombia',
  'es': 'España',
  'br': 'Brasil'
}

/**
 * Obtiene noticias de NewsAPI
 */
export const fetchNewsFromAPI = async (options = {}) => {
  const {
    category = 'technology',
    country = 'us',
    pageSize = 20,
    page = 1,
    query = ''
  } = options

  try {
    let url = `${NEWSAPI_BASE_URL}/top-headlines?`
    const params = new URLSearchParams({
      apiKey: NEWSAPI_KEY,
      category,
      country,
      pageSize: pageSize.toString(),
      page: page.toString()
    })

    if (query) {
      params.append('q', query)
    }

    url += params.toString()

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.status !== 'ok') {
      throw new Error(`NewsAPI error: ${data.message}`)
    }

    return data.articles || []
  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error)
    throw error
  }
}

/**
 * Busca noticias por query específico
 */
export const searchNews = async (query, options = {}) => {
  const {
    pageSize = 20,
    page = 1,
    sortBy = 'publishedAt',
    from = null,
    to = null
  } = options

  try {
    let url = `${NEWSAPI_BASE_URL}/everything?`
    const params = new URLSearchParams({
      apiKey: NEWSAPI_KEY,
      q: query,
      pageSize: pageSize.toString(),
      page: page.toString(),
      sortBy
    })

    if (from) {
      params.append('from', from)
    }
    if (to) {
      params.append('to', to)
    }

    url += params.toString()

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.status !== 'ok') {
      throw new Error(`NewsAPI error: ${data.message}`)
    }

    return data.articles || []
  } catch (error) {
    console.error('Error searching news:', error)
    throw error
  }
}

/**
 * Procesa y guarda noticias en la base de datos
 */
export const processAndSaveNews = async (articles, categoryId) => {
  try {
    const processedNews = []

    for (const article of articles) {
      // Verificar si la noticia ya existe (más robusto)
      const { data: existingNews, error: checkError } = await supabase
        .from('news')
        .select('id, title')
        .or(`source_url.eq.${article.url},title.eq.${article.title}`)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing news:', checkError)
        // Continuar con la inserción si hay error en la verificación
      }

      if (existingNews) {
        console.log(`News already exists, skipping: ${article.title}`)
        continue
      }

      // Generar contenido en ambos idiomas usando IA
      const summaryEs = await generateNewsSummary(article.description || article.content, { language: 'es' })
      const summaryEn = await generateNewsSummary(article.description || article.content, { language: 'en' })
      
      const contentEs = await generateLinkedInPost(article.title, summaryEs, { language: 'es' })
      const contentEn = await generateLinkedInPost(article.title, summaryEn, { language: 'en' })
      
      const hashtagsEs = await generateHashtags(article.title, summaryEs, { language: 'es' })
      const hashtagsEn = await generateHashtags(article.title, summaryEn, { language: 'en' })
      
      const imagePromptEs = await generateImagePrompt(article.title, summaryEs, { language: 'es' })
      const imagePromptEn = await generateImagePrompt(article.title, summaryEn, { language: 'en' })

      // Preparar datos de la noticia
      const newsData = {
        category_id: categoryId,
        title: article.title || 'Sin título',
        source_url: article.url,
        image_url: article.urlToImage,
        source_name: article.source?.name || 'Fuente desconocida',
        published_at: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
        // Contenido en español
        summary_es: summaryEs,
        content_es: contentEs,
        hashtags_es: hashtagsEs,
        image_prompt_es: imagePromptEs,
        // Contenido en inglés
        summary_en: summaryEn,
        content_en: contentEn,
        hashtags_en: hashtagsEn,
        image_prompt_en: imagePromptEn,
        // Mantener compatibilidad con columnas anteriores
        summary: summaryEs, // Por defecto español
        content: contentEs,
        hashtags: hashtagsEs,
        image_prompt: imagePromptEs,
        is_processed: true
      }

      // Insertar en la base de datos
      const { data, error } = await supabase
        .from('news')
        .insert([newsData])
        .select()
        .single()

      if (error) {
        console.error('Error saving news:', error)
        console.error('News data:', newsData)
        
        // Si es error de RLS o 406, continuar sin fallar
        if (error.code === '42501' || error.code === 'PGRST116') {
          console.log('Permission error detected, skipping this news item')
        }
        continue
      }

      processedNews.push(data)
    }

    return processedNews
  } catch (error) {
    console.error('Error processing news:', error)
    throw error
  }
}

/**
 * Recolecta noticias para todas las categorías activas
 */
export const collectNewsForAllCategories = async () => {
  try {
    // Obtener categorías activas
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .eq('provider_type', 'newsapi')

    if (error) {
      throw error
    }

    const results = []

    for (const category of categories) {
      try {
        console.log(`Collecting news for category: ${category.name}`)
        
        const articles = await fetchNewsFromAPI({
          category: category.newsapi_category,
          pageSize: 10 // Limitar para evitar exceder cuotas
        })

        const processedNews = await processAndSaveNews(articles, category.id)
        
        results.push({
          category: category.name,
          collected: processedNews.length,
          total: articles.length
        })

        // Actualizar contador de uso
        await supabase
          .from('categories')
          .update({ usage_count: category.usage_count + 1 })
          .eq('id', category.id)

      } catch (error) {
        console.error(`Error collecting news for category ${category.name}:`, error)
        results.push({
          category: category.name,
          error: error.message
        })
      }
    }

    return results
  } catch (error) {
    console.error('Error in collectNewsForAllCategories:', error)
    throw error
  }
}

/**
 * Obtiene noticias de la base de datos
 */
export const getNewsFromDatabase = async (options = {}) => {
  const {
    categoryId = null,
    limit = 20,
    offset = 0,
    processed = true,
    language = 'es'
  } = options

  try {
    let query = supabase
      .from('news')
      .select(`
        *,
        categories (
          id,
          name,
          description
        )
      `)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (processed !== null) {
      query = query.eq('is_processed', processed)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Procesar los datos para incluir el contenido en el idioma correcto
    const processedData = (data || []).map(item => ({
      ...item,
      // Usar el contenido en el idioma seleccionado
      summary: language === 'en' && item.summary_en ? item.summary_en : item.summary_es || item.summary,
      content: language === 'en' && item.content_en ? item.content_en : item.content_es || item.content,
      hashtags: language === 'en' && item.hashtags_en ? item.hashtags_en : item.hashtags_es || item.hashtags,
      image_prompt: language === 'en' && item.image_prompt_en ? item.image_prompt_en : item.image_prompt_es || item.image_prompt
    }))

    return processedData
  } catch (error) {
    console.error('Error fetching news from database:', error)
    throw error
  }
}

/**
 * Marca noticias como procesadas
 */
export const markNewsAsProcessed = async (newsIds) => {
  try {
    const { error } = await supabase
      .from('news')
      .update({ is_processed: true })
      .in('id', newsIds)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error marking news as processed:', error)
    throw error
  }
}

/**
 * Borra todas las noticias (SOLO PARA PRUEBAS)
 */
export const deleteAllNews = async () => {
  try {
    // Solo permitir en modo desarrollo
    if (localStorage.getItem('app_mode') === 'production') {
      throw new Error('No se puede borrar noticias en modo producción')
    }

    // Primero obtenemos todos los IDs para borrarlos uno por uno (más seguro)
    const { data: allNews, error: fetchError } = await supabase
      .from('news')
      .select('id')

    if (fetchError) {
      throw fetchError
    }

    if (!allNews || allNews.length === 0) {
      console.log('No hay noticias para borrar')
      return []
    }

    // Borrar todas las noticias usando los IDs obtenidos
    const { data, error } = await supabase
      .from('news')
      .delete()
      .in('id', allNews.map(item => item.id))

    if (error) {
      throw error
    }

    console.log('Todas las noticias han sido borradas (modo pruebas)')
    return data
  } catch (error) {
    console.error('Error deleting all news:', error)
    throw error
  }
}

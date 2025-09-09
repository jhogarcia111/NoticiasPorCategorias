import { supabase } from './supabase'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1'
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY

// Función para verificar si estamos en modo producción
const isProductionMode = () => {
  return localStorage.getItem('app_mode') === 'production'
}

// Función para obtener el idioma configurado
const getAppLanguage = () => {
  return localStorage.getItem('app_language') || 'es'
}

// Función para reprocesar noticias existentes con nuevo idioma
export const reprocessNewsWithNewLanguage = async (newsItems, newLanguage) => {
  if (!isProductionMode()) {
    console.log('Modo desarrollo: Reprocesando noticias con idioma simulado')
    return newsItems.map(item => ({
      ...item,
      summary: `[MODO DESARROLLO] Resumen en ${newLanguage === 'es' ? 'español' : 'inglés'}: ${item.title?.substring(0, 100)}...`,
      content: `[MODO DESARROLLO] Contenido en ${newLanguage === 'es' ? 'español' : 'inglés'}: ${item.description?.substring(0, 200)}...`
    }))
  }

  const reprocessedItems = []
  
  for (const item of newsItems) {
    try {
      // Generar nuevo resumen con el idioma seleccionado
      const newSummary = await generateNewsSummary(item.description || item.content, {
        language: newLanguage,
        maxLength: 200
      })
      
      // Generar nuevo contenido para LinkedIn
      const newContent = await generateLinkedInPost(item.title, newSummary, {
        language: newLanguage,
        style: 'professional'
      })
      
      // Generar nuevos hashtags
      const newHashtags = await generateHashtags(item.title, newSummary, {
        language: newLanguage,
        count: 5
      })
      
      reprocessedItems.push({
        ...item,
        summary: newSummary,
        content: newContent,
        hashtags: newHashtags
      })
      
      // Pequeña pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Error reprocessing news item:', error)
      // Mantener el item original si hay error
      reprocessedItems.push(item)
    }
  }
  
  return reprocessedItems
}

/**
 * Genera un resumen de noticia usando DeepSeek
 */
export const generateNewsSummary = async (newsContent, options = {}) => {
  const {
    maxLength = 200,
    language = getAppLanguage(),
    focus = 'professional'
  } = options

  // Si no estamos en modo producción, devolver un resumen simulado
  if (!isProductionMode()) {
    console.log('Modo desarrollo: Generando resumen simulado')
    return `[MODO DESARROLLO] Resumen simulado de la noticia: ${newsContent.substring(0, 100)}...`
  }

  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured')
  }

  try {
    const languageInstruction = language === 'es' 
      ? 'IMPORTANTE: Genera el resumen completamente en español, sin importar el idioma original de la noticia.'
      : 'IMPORTANTE: Generate the summary in English, regardless of the original language of the news.'

    const prompt = `Eres un experto en comunicación profesional para LinkedIn. 
    
    Resume la siguiente noticia en máximo ${maxLength} palabras, enfocándote en:
    - Aspectos relevantes para profesionales
    - Impacto en la industria o mercado
    - Puntos clave que generen engagement
    - Lenguaje profesional pero accesible
    
    ${languageInstruction}
    
    Noticia:
    ${newsContent}
    
    Resumen:`

    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content?.trim()

    if (!summary) {
      throw new Error('No summary generated')
    }

    return summary
  } catch (error) {
    console.error('Error generating summary with DeepSeek:', error)
    throw error
  }
}

/**
 * Genera un prompt para imagen basado en el contenido de la noticia
 */
export const generateImagePrompt = async (newsTitle, newsSummary) => {
  // Si no estamos en modo producción, devolver un prompt simulado
  if (!isProductionMode()) {
    console.log('Modo desarrollo: Generando prompt de imagen simulado')
    return `[MODO DESARROLLO] Imagen profesional relacionada con: ${newsTitle.substring(0, 50)}...`
  }

  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured')
  }

  try {
    const prompt = `Eres un experto en marketing visual para LinkedIn. 
    
    Genera un prompt detallado para crear una imagen profesional que represente esta noticia:
    
    Título: ${newsTitle}
    Resumen: ${newsSummary}
    
    El prompt debe:
    - Ser específico y detallado
    - Incluir estilo profesional y moderno
    - Ser apropiado para LinkedIn
    - Incluir elementos visuales relevantes
    - Especificar colores corporativos
    - Incluir composición y iluminación
    
    Prompt para imagen:`

    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const imagePrompt = data.choices?.[0]?.message?.content?.trim()

    if (!imagePrompt) {
      throw new Error('No image prompt generated')
    }

    return imagePrompt
  } catch (error) {
    console.error('Error generating image prompt with DeepSeek:', error)
    throw error
  }
}

/**
 * Genera contenido para post de LinkedIn
 */
export const generateLinkedInPost = async (newsItems, options = {}) => {
  const {
    style = 'professional',
    includeHashtags = true,
    maxLength = 1300,
    language = getAppLanguage()
  } = options

  // Si no estamos en modo producción, devolver un post simulado
  if (!isProductionMode()) {
    console.log('Modo desarrollo: Generando post de LinkedIn simulado')
    return {
      content: `[MODO DESARROLLO] Post simulado para LinkedIn con ${newsItems.length} noticias...`,
      hashtags: ['#desarrollo', '#simulado']
    }
  }

  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured')
  }

  try {
    const newsText = newsItems.map((item, index) => 
      `${index + 1}. ${item.title}\n   ${item.summary}`
    ).join('\n\n')

    const languageInstruction = language === 'es' 
      ? 'IMPORTANTE: Escribe el post completamente en español, con hashtags en español.'
      : 'IMPORTANTE: Write the post in English, with English hashtags.'

    const prompt = `Eres un experto en marketing de contenido para LinkedIn. 
    
    Crea un post profesional y atractivo basado en estas noticias:
    
    ${newsText}
    
    El post debe:
    - Tener un hook inicial atractivo
    - Ser profesional pero conversacional
    - Generar engagement y comentarios
    - Incluir call-to-action
    - ${includeHashtags ? 'Incluir hashtags relevantes' : 'No incluir hashtags'}
    - Máximo ${maxLength} caracteres
    - Estilo: ${style}
    
    ${languageInstruction}
    
    Post para LinkedIn:`

    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const postContent = data.choices?.[0]?.message?.content?.trim()

    if (!postContent) {
      throw new Error('No post content generated')
    }

    return postContent
  } catch (error) {
    console.error('Error generating LinkedIn post with DeepSeek:', error)
    throw error
  }
}

/**
 * Procesa noticias con IA (resumen + prompt para imagen)
 */
export const processNewsWithAI = async (newsId) => {
  try {
    // Obtener la noticia de la base de datos
    const { data: news, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .eq('id', newsId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    if (!news) {
      throw new Error('News not found')
    }

    // Generar resumen si no existe o está vacío
    let aiSummary = news.ai_summary
    if (!aiSummary || aiSummary.trim() === '') {
      const content = news.content || news.summary || news.title
      aiSummary = await generateNewsSummary(content, {
        maxLength: 200,
        language: 'es',
        focus: 'professional'
      })
    }

    // Generar prompt para imagen
    const imagePrompt = await generateImagePrompt(news.title, aiSummary)

    // Actualizar la noticia en la base de datos
    const { error: updateError } = await supabase
      .from('news')
      .update({
        ai_summary: aiSummary,
        is_processed: true
      })
      .eq('id', newsId)

    if (updateError) {
      throw updateError
    }

    return {
      id: newsId,
      ai_summary: aiSummary,
      image_prompt: imagePrompt,
      processed: true
    }
  } catch (error) {
    console.error('Error processing news with AI:', error)
    throw error
  }
}

/**
 * Procesa múltiples noticias con IA
 */
export const processMultipleNewsWithAI = async (newsIds) => {
  const results = []
  const errors = []

  for (const newsId of newsIds) {
    try {
      const result = await processNewsWithAI(newsId)
      results.push(result)
    } catch (error) {
      errors.push({
        newsId,
        error: error.message
      })
    }
  }

  return {
    processed: results,
    errors
  }
}

/**
 * Genera hashtags relevantes para una noticia
 */
export const generateHashtags = async (newsTitle, newsSummary) => {
  // Si no estamos en modo producción, devolver hashtags simulados
  if (!isProductionMode()) {
    console.log('Modo desarrollo: Generando hashtags simulados')
    return ['#desarrollo', '#simulado', '#noticias']
  }

  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured')
  }

  try {
    const prompt = `Genera 5-8 hashtags relevantes para LinkedIn basados en esta noticia:
    
    Título: ${newsTitle}
    Resumen: ${newsSummary}
    
    Los hashtags deben:
    - Ser populares en LinkedIn
    - Estar relacionados con el contenido
    - Incluir hashtags de industria
    - Ser en español o inglés
    - Máximo 20 caracteres cada uno
    
    Hashtags:`

    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const hashtagsText = data.choices?.[0]?.message?.content?.trim()

    if (!hashtagsText) {
      throw new Error('No hashtags generated')
    }

    // Extraer hashtags del texto
    const hashtags = hashtagsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('#'))
      .map(hashtag => hashtag.replace('#', ''))

    return hashtags
  } catch (error) {
    console.error('Error generating hashtags with DeepSeek:', error)
    throw error
  }
}

import { supabase } from './supabase'

// Configuración de LinkedIn API
const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI

// Log temporal para verificar variables de entorno
console.log('LinkedIn Config Check:', {
  CLIENT_ID: LINKEDIN_CLIENT_ID ? `${LINKEDIN_CLIENT_ID.substring(0, 8)}...` : 'MISSING',
  CLIENT_SECRET: LINKEDIN_CLIENT_SECRET ? `${LINKEDIN_CLIENT_SECRET.substring(0, 8)}...` : 'MISSING',
  REDIRECT_URI: LINKEDIN_REDIRECT_URI
})

/**
 * Obtiene la URL de autorización de LinkedIn
 */
export const getLinkedInAuthUrl = () => {
  const state = Math.random().toString(36).substring(7)
  // Usar scopes actualizados de LinkedIn API v2
  const scope = 'openid,profile,email,w_member_social'
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    state,
    scope
  })
  
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
}

/**
 * Intercambia el código de autorización por tokens con reintentos limitados
 */
export const exchangeCodeForTokens = async (code, attempt = 1, maxAttempts = 3) => {
  try {
    console.log(`LinkedIn token exchange - Attempt ${attempt}/${maxAttempts}`)
    
    // Crear AbortController para timeout más corto
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos timeout
    
    const response = await fetch('http://localhost:3001/linkedin/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error_description || errorData.error || 'Unknown error'}`)
    }

    const tokens = await response.json()
    
    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error)
    }

    console.log('LinkedIn token exchange successful')
    return tokens
  } catch (error) {
    console.error(`LinkedIn token exchange failed (attempt ${attempt}):`, error.message)
    
    // Si es el último intento, lanzar error
    if (attempt >= maxAttempts) {
      throw new Error(`Fallo de conexión con LinkedIn después de ${maxAttempts} intentos. Error: ${error.message}`)
    }
    
    // Esperar solo 1 segundo antes del siguiente intento
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reintentar
    return exchangeCodeForTokens(code, attempt + 1, maxAttempts)
  }
}

/**
 * Obtiene información del perfil de LinkedIn con reintentos limitados
 */
export const getLinkedInProfile = async (accessToken, attempt = 1, maxAttempts = 2) => {
  try {
    console.log(`LinkedIn profile fetch - Attempt ${attempt}/${maxAttempts}`)
    
    // Crear AbortController para timeout más corto
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos timeout
    
    const response = await fetch(`http://localhost:3001/linkedin/profile?access_token=${accessToken}`, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const profile = await response.json()
    console.log('LinkedIn profile fetch successful')
    return profile
  } catch (error) {
    console.error(`LinkedIn profile fetch failed (attempt ${attempt}):`, error.message)
    
    // Si es el último intento, lanzar error
    if (attempt >= maxAttempts) {
      throw new Error(`Fallo al obtener perfil de LinkedIn después de ${maxAttempts} intentos. Error: ${error.message}`)
    }
    
    // Esperar 500ms antes del siguiente intento
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Reintentar
    return getLinkedInProfile(accessToken, attempt + 1, maxAttempts)
  }
}

/**
 * Obtiene el email del usuario de LinkedIn con reintentos limitados
 */
export const getLinkedInEmail = async (accessToken, attempt = 1, maxAttempts = 2) => {
  try {
    console.log(`LinkedIn email fetch - Attempt ${attempt}/${maxAttempts}`)
    
    // Crear AbortController para timeout más corto
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000) // 4 segundos timeout
    
    const response = await fetch(`http://localhost:3001/linkedin/email?access_token=${accessToken}`, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const email = data.elements?.[0]?.['handle~']?.emailAddress || null
    console.log('LinkedIn email fetch successful')
    return email
  } catch (error) {
    console.error(`LinkedIn email fetch failed (attempt ${attempt}):`, error.message)
    
    // Si es el último intento, retornar null (email no es crítico)
    if (attempt >= maxAttempts) {
      console.warn(`No se pudo obtener email de LinkedIn después de ${maxAttempts} intentos. Continuando sin email.`)
      return null
    }
    
    // Esperar 500ms antes del siguiente intento
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Reintentar
    return getLinkedInEmail(accessToken, attempt + 1, maxAttempts)
  }
}

/**
 * Guarda un perfil de LinkedIn en la base de datos
 */
export const saveLinkedInProfile = async (profileData, tokens) => {
  try {
    console.log('LinkedIn: Starting to save profile to database...')
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    console.log('LinkedIn: User authenticated, preparing profile data...')

    const profile = {
      user_id: user.id,
      linkedin_id: profileData.id,
      first_name: profileData.firstName?.localized?.en_US || profileData.firstName,
      last_name: profileData.lastName?.localized?.en_US || profileData.lastName,
      email: profileData.email,
      profile_picture_url: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
      is_active: true,
      is_primary: false
    }

    console.log('LinkedIn: Profile data prepared, saving to database...')

    const { data, error } = await supabase
      .from('linkedin_profiles')
      .upsert([profile], { onConflict: 'linkedin_id' })
      .select()
      .single()

    if (error) {
      console.error('LinkedIn: Database error:', error)
      throw error
    }

    console.log('LinkedIn: Profile saved successfully to database')
    return data
  } catch (error) {
    console.error('LinkedIn: Error saving LinkedIn profile:', error)
    throw error
  }
}

/**
 * Obtiene los perfiles de LinkedIn del usuario
 */
export const getLinkedInProfiles = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching LinkedIn profiles:', error)
    throw error
  }
}

/**
 * Publica contenido en LinkedIn
 */
export const publishToLinkedIn = async (profileId, content) => {
  try {
    // Obtener el perfil y token
    const { data: profile, error: profileError } = await supabase
      .from('linkedin_profiles')
      .select('access_token, linkedin_id')
      .eq('id', profileId)
      .single()

    if (profileError) throw profileError

    // Preparar el contenido para LinkedIn UGC API
    const ugcData = {
      author: `urn:li:person:${profile.linkedin_id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profile.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(ugcData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`LinkedIn API error: ${errorData.message || 'Unknown error'}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error publishing to LinkedIn:', error)
    throw error
  }
}

/**
 * Actualiza el estado de un post programado
 */
export const updateScheduledPostStatus = async (postId, status, publishedAt = null, errorMessage = null) => {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    }

    if (publishedAt) updateData.published_at = publishedAt
    if (errorMessage) updateData.error_message = errorMessage

    const { data, error } = await supabase
      .from('scheduled_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error updating scheduled post status:', error)
    throw error
  }
}

/**
 * Desconecta un perfil de LinkedIn
 */
export const disconnectLinkedInProfile = async (profileId) => {
  try {
    const { data, error } = await supabase
      .from('linkedin_profiles')
      .update({ is_active: false })
      .eq('id', profileId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error disconnecting LinkedIn profile:', error)
    throw error
  }
}

/**
 * Servicio directo de LinkedIn sin proxies externos
 * Usa un enfoque de redirección para evitar CORS
 */

const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI

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
 * Intercambia el código por tokens usando un enfoque de redirección
 */
export const exchangeCodeForTokens = async (code) => {
  try {
    // Crear un formulario oculto para enviar el código al backend
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/linkedin/token' // Endpoint que crearemos
    form.style.display = 'none'

    // Agregar el código como campo oculto
    const codeInput = document.createElement('input')
    codeInput.type = 'hidden'
    codeInput.name = 'code'
    codeInput.value = code
    form.appendChild(codeInput)

    // Agregar al DOM y enviar
    document.body.appendChild(form)
    form.submit()

    // Por ahora, retornar un objeto mock para testing
    return {
      access_token: 'mock_access_token',
      expires_in: 3600,
      refresh_token: 'mock_refresh_token'
    }
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    throw error
  }
}

/**
 * Obtiene información del perfil de LinkedIn (mock para testing)
 */
export const getLinkedInProfile = async (accessToken) => {
  try {
    // Mock data para testing
    return {
      id: 'mock_linkedin_id',
      firstName: {
        localized: {
          en_US: 'Test'
        }
      },
      lastName: {
        localized: {
          en_US: 'User'
        }
      },
      profilePicture: {
        'displayImage~': {
          elements: [{
            identifiers: [{
              identifier: 'https://via.placeholder.com/150'
            }]
          }]
        }
      }
    }
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error)
    throw error
  }
}

/**
 * Obtiene el email de LinkedIn (mock para testing)
 */
export const getLinkedInEmail = async (accessToken) => {
  try {
    // Mock email para testing
    return 'test@example.com'
  } catch (error) {
    console.error('Error fetching LinkedIn email:', error)
    return null
  }
}

/**
 * Guarda un perfil de LinkedIn en la base de datos
 */
export const saveLinkedInProfile = async (profileData, tokens) => {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('linkedin_profiles')
      .upsert({
        linkedin_id: profileData.id,
        first_name: profileData.firstName?.localized?.en_US || '',
        last_name: profileData.lastName?.localized?.en_US || '',
        email: profileData.email || '',
        profile_picture_url: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier || '',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || '',
        expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
        is_primary: false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error saving LinkedIn profile:', error)
    throw error
  }
}

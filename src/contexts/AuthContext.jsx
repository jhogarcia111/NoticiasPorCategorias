import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    let timeoutId = null

    const clearAuthTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const initializeAuth = async () => {
      try {
        // Verificar si estamos en un callback de LinkedIn
        const urlParams = new URLSearchParams(window.location.search)
        const isLinkedInCallback = urlParams.get('code') && window.location.pathname.includes('/auth/linkedin/callback')
        
        // Si es un callback de LinkedIn, no aplicar timeout - dejar que LinkedInCallback maneje
        if (isLinkedInCallback) {
          console.log('LinkedIn callback detected - skipping auth timeout')
          setLoading(false)
          return
        }
        
        // Timeout de seguridad más largo para dar tiempo a cargar el perfil
        const timeoutDuration = 30000
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('Auth loading timeout - forcing loading to false')
            setLoading(false)
            setError(new Error('Timeout de autenticación - la sesión puede estar activa pero el perfil no se pudo cargar'))
          }
        }, timeoutDuration)

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return

        if (error) {
          console.error('Error getting session:', error)
          setError(error)
          setLoading(false)
          clearAuthTimeout()
          return
        }
        
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id, clearAuthTimeout)
        } else {
          setLoading(false)
          clearAuthTimeout()
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error in initializeAuth:', error)
          setError(error)
          setLoading(false)
        }
        clearAuthTimeout()
      }
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      // console.log('Auth state change:', event, session?.user?.id)
      
      // Solo procesar cambios significativos
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Solo cargar perfil si no lo tenemos
          if (!profile) {
            await fetchUserProfile(session.user.id, clearAuthTimeout)
          } else {
            setLoading(false)
            clearAuthTimeout()
          }
        } else {
          setProfile(null)
          setLoading(false)
          clearAuthTimeout()
        }
      }
    })

    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const fetchUserProfile = async (userId, clearAuthTimeout) => {
    try {
      // console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...')
          await createUserProfile(userId, clearAuthTimeout)
        } else {
          // Si hay otro error, establecer loading en false para evitar carga infinita
          console.error('Profile fetch error:', error)
          setError(error)
          setLoading(false)
          if (clearAuthTimeout) clearAuthTimeout()
        }
      } else {
        // console.log('Profile fetched successfully:', data)
        setProfile(data)
        setLoading(false)
        setError(null) // Limpiar error si todo está bien
        if (clearAuthTimeout) clearAuthTimeout()
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      setError(error)
      setLoading(false) // Asegurar que loading se establezca en false
      if (clearAuthTimeout) clearAuthTimeout()
    }
  }

  const createUserProfile = async (userId, clearAuthTimeout) => {
    try {
      console.log('Creating profile for user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            username: user?.email?.split('@')[0] || 'user',
            role: 'user'
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        setError(error)
      } else {
        console.log('Profile created successfully:', data)
        setProfile(data)
        setError(null)
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      setError(error)
    } finally {
      setLoading(false) // Asegurar que loading se establezca en false
      if (clearAuthTimeout) clearAuthTimeout()
    }
  }

  const signUp = async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (!error && data) {
        setProfile(data)
      }
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin: profile?.role === 'admin',
    clearError: () => setError(null)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

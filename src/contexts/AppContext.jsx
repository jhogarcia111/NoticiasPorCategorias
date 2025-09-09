import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext({})

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [isProductionMode, setIsProductionMode] = useState(() => {
    // Por defecto en modo pruebas para desarrollo
    return localStorage.getItem('app_mode') === 'production'
  })

  const [language, setLanguage] = useState(() => {
    // Por defecto en español
    return localStorage.getItem('app_language') || 'es'
  })

  useEffect(() => {
    localStorage.setItem('app_mode', isProductionMode ? 'production' : 'development')
  }, [isProductionMode])

  useEffect(() => {
    localStorage.setItem('app_language', language)
  }, [language])

  const toggleProductionMode = () => {
    setIsProductionMode(prev => !prev)
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es')
  }

  const value = {
    isProductionMode,
    language,
    toggleProductionMode,
    toggleLanguage,
    isDevelopmentMode: !isProductionMode
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

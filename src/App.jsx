import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AuthFallback } from './components/auth/AuthFallback'
import { AppControls } from './components/common/AppControls'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { LinkedInCallback } from './components/linkedin/LinkedInCallback'
import { LoadingSpinner } from './components/common/LoadingSpinner'

function AppContent() {
  const { loading, error, clearError, user, profile } = useAuth()
  const navigate = useNavigate()

  // console.log('AppContent - loading:', loading, 'user:', user, 'error:', error)

  const handleRetry = () => {
    clearError()
    window.location.reload()
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleContinue = () => {
    clearError()
    // Forzar que loading sea false para continuar
    // Esto debería permitir que la aplicación continúe
    window.location.reload()
  }

  // Si hay un usuario autenticado pero hay error, mostrar opción de continuar
  if (error && user && !loading) {
    return (
      <AuthFallback 
        error={error} 
        onRetry={handleRetry}
        onLogin={handleLogin}
        onContinue={handleContinue}
        user={user}
      />
    )
  } else if (error && !user) {
    return (
      <AuthFallback 
        error={error} 
        onRetry={handleRetry}
        onLogin={handleLogin}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  // Si hay usuario autenticado, mostrar dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <AppControls />
        <Routes>
          <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    )
  }

  // Si no hay usuario, mostrar login/register
  return (
    <div className="min-h-screen bg-background">
      <AppControls />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App

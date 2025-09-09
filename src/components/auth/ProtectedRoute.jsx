import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingPage } from '../common/LoadingSpinner'

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // console.log('ProtectedRoute - user:', user, 'loading:', loading)

  if (loading) {
    // console.log('ProtectedRoute - showing loading page')
    return <LoadingPage />
  }

  if (!user) {
    // console.log('ProtectedRoute - no user, redirecting to login')
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // console.log('ProtectedRoute - user authenticated, showing children')
  return children
}

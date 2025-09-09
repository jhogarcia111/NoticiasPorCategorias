import { useAuth } from '../../contexts/AuthContext'
import { AdminDashboard } from './AdminDashboard'
import { UserDashboard } from './UserDashboard'

export const DashboardWrapper = () => {
  const { profile, isAdmin } = useAuth()

  if (!profile) {
    return <div>Cargando perfil...</div>
  }

  return isAdmin ? <AdminDashboard /> : <UserDashboard />
}

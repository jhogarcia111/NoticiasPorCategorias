import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { DashboardWrapper } from '../components/dashboard/DashboardWrapper'
import { LoadingPage } from '../components/common/LoadingSpinner'

export const DashboardPage = () => {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  return (
    <Routes>
      <Route path="/*" element={<DashboardWrapper />} />
    </Routes>
  )
}

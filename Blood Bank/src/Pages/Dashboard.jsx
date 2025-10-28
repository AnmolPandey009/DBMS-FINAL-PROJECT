import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, getDashboardRoute } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      // Redirect to role-specific dashboard
      const dashboardRoute = getDashboardRoute()
      navigate(dashboardRoute, { replace: true })
    }
  }, [user, navigate, getDashboardRoute])

  // Show loading while redirecting
  return (
    <div className="container-responsive py-12">
      <div className="text-center">Redirecting to your dashboard...</div>
    </div>
  )
}

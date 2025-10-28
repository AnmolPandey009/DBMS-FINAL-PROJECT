import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AuthRedirect = () => {
  const { user, loading, getDashboardRoute } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      // User is logged in, redirect to their dashboard
      const dashboardRoute = getDashboardRoute()
      navigate(dashboardRoute, { replace: true })
    } else if (!loading && !user) {
      // User is not logged in, redirect to login
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate, getDashboardRoute])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}

export default AuthRedirect

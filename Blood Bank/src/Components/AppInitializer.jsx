import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AppInitializer = ({ children }) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      // Only redirect from login/signup pages, allow access to home page
      if (user && (window.location.pathname === '/login' || window.location.pathname === '/signup')) {
        const userRole = user.role?.toLowerCase()
        let dashboardRoute = '/dashboard'
        
        switch (userRole) {
          case 'donor':
            dashboardRoute = '/donor-dashboard'
            break
          case 'patient':
            dashboardRoute = '/patient-dashboard'
            break
          case 'hospital':
            dashboardRoute = '/hospital-dashboard'
            break
          case 'admin':
            dashboardRoute = '/admin-dashboard'
            break
          default:
            dashboardRoute = '/dashboard'
        }
        
        navigate(dashboardRoute, { replace: true })
      }
    }
  }, [user, loading, navigate])

  return children
}

export default AppInitializer

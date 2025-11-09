import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Initialize user from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          
          // Verify token is still valid by making a request to the backend
          try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (!response.ok) {
              // Token is invalid, clear storage
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              setUser(null)
            }
          } catch (error) {
            console.error('Token verification failed:', error)
            // Keep user logged in if network error
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    
    initializeAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials)
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
        return { success: true, user: response.user }
      } else {
        return { success: false, error: response.message || 'Login failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await apiService.signup(userData)
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
        return { success: true, user: response.user }
      } else {
        return { success: false, error: response.message || 'Signup failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const getDashboardRoute = () => {
    if (!user) return '/dashboard'
    
    const normalizedRole = user.role?.toLowerCase()
    
    switch (normalizedRole) {
      case 'donor':
        return '/donor-dashboard'
      case 'patient':
        return '/patient-dashboard'
      case 'hospital':
        return '/hospital-dashboard'
      case 'admin':
        return '/admin-dashboard'
      default:
        return '/dashboard'
    }
  }

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token')
  }

  const hasRole = (role) => {
    return user?.role?.toLowerCase() === role?.toLowerCase()
  }

  const hasAnyRole = (roles) => {
    return roles.map(r => r.toLowerCase()).includes(user?.role?.toLowerCase())
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    getDashboardRoute,
    isAuthenticated,
    hasRole,
    hasAnyRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

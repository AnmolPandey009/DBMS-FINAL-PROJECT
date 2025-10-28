import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
  }

  const getDashboardLink = () => {
    if (!user) return '/dashboard'
    
    switch (user.role) {
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

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BB</span>
                </div>
              </div>
              <div className="ml-2">
                <span className="text-xl font-bold text-gray-900">Blood Bank</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/blood-inventory" className="text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
              Inventory
            </Link>
            <Link to="/blood-requests" className="text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
              Requests
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to={getDashboardLink()} 
                  className="text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                
                {/* Role-specific links */}
                {user.role === 'donor' && (
                  <Link to="/donor-registration" className="text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                    Register
                  </Link>
                )}
                
                {user.role === 'patient' && (
                  <Link to="/patient-registration" className="text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                    Register
                  </Link>
                )}
                
                {user.role === 'hospital' && (
                  <Link to="/hospital-management" className="text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                    Manage
                  </Link>
                )}
                
                {user.role === 'admin' && (
                  <Link to="/admin-panel" className="text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                    Admin Panel
                  </Link>
                )}

                <div className="relative">
                  <button className="flex items-center text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                    <span className="mr-1">{user.name}</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {user.role}
                    </span>
                  </button>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/signup" className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-red-500 focus:outline-none focus:text-red-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            <Link to="/" className="text-gray-700 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link to="/blood-inventory" className="text-gray-700 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
              Inventory
            </Link>
            <Link to="/blood-requests" className="text-gray-700 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
              Requests
            </Link>
            
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
                  Dashboard
                </Link>
                
                {user.role === 'donor' && (
                  <Link to="/donor-registration" className="text-gray-700 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
                    Register
                  </Link>
                )}
                
                {user.role === 'patient' && (
                  <Link to="/patient-registration" className="text-gray-700 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
                    Register
                  </Link>
                )}
                
                {user.role === 'hospital' && (
                  <Link to="/hospital-management" className="text-gray-700 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
                    Manage
                  </Link>
                )}
                
                {user.role === 'admin' && (
                  <Link to="/admin-panel" className="text-gray-700 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
                    Admin Panel
                  </Link>
                )}
                
                <div className="border-t pt-2">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Logged in as: {user.name} ({user.role})
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left bg-red-500 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium">
                  Login
                </Link>
                <Link to="/signup" className="bg-red-500 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-red-600">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

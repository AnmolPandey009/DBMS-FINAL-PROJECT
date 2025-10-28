import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
  const { login, getDashboardRoute } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (data) => {
    try {
      setError('')
      const result = await login(schema.parse(data))
      
      if (result.success) {
        reset()
        // Use the getDashboardRoute from AuthContext to redirect to the correct dashboard
        const dashboardRoute = getDashboardRoute()
        navigate(dashboardRoute, { replace: true })
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="container-responsive py-12 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit((values) => onSubmit(schema.parse(values)))} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input 
            type="email" 
            {...register('email', { required: true })} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input 
            type="password" 
            {...register('password', { required: true })} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Enter your password"
          />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        <button 
          disabled={isSubmitting} 
          type="submit" 
          className="w-full rounded-md bg-red-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-red-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account? 
        <button onClick={() => navigate('/signup')} className="text-red-500 hover:underline ml-1">
          Sign Up
        </button>
      </p>
    </div>
  )
}
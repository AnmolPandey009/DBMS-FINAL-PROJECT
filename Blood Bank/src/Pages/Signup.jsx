import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['Donor', 'Patient', 'Hospital']),
  age: z.coerce.number().min(1, 'Age must be at least 1').max(120, 'Age must be at most 120'),
  gender: z.enum(['Male', 'Female', 'Other']),
  blood_group: z.string().min(1, 'Please select a blood group'),
  contact: z.string().min(10, 'Contact number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  pincode: z.string().min(6, 'Pincode must be at least 6 digits'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
const API_BASE_URL = 'http://localhost:5000/api'

export default function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()
  const navigate = useNavigate()
  const { signup, getDashboardRoute } = useAuth()
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    try {
      setError('')
      const result = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        age: data.age,
        gender: data.gender,
        blood_group: data.blood_group,
        contact: data.contact,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      })
      
      if (result.success) {
        reset()
        // Use the getDashboardRoute from AuthContext to redirect to the correct dashboard
        const dashboardRoute = getDashboardRoute()
        navigate(dashboardRoute, { replace: true })
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Network error. Please try again.')
    }
  }

  return (
     <div className="container-responsive py-12">
      <h1 className="text-2xl font-semibold mb-6">Sign Up</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
       <form onSubmit={handleSubmit((values) => onSubmit(schema.parse(values)))} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input 
            {...register('name', { required: true })} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>

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
           <label className="block text-sm mb-1">Age</label>
           <input 
             type="number" 
             {...register('age', { required: true })} 
             className="w-full rounded-md border px-3 py-2 text-sm" 
             placeholder="Enter your age"
             min="1"
             max="120"
           />
           {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age.message}</p>}
         </div>

         <div>
           <label className="block text-sm mb-1">Gender</label>
           <select {...register('gender', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm">
             <option value="">Select gender</option>
             <option value="Male">Male</option>
             <option value="Female">Female</option>
             <option value="Other">Other</option>
           </select>
           {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender.message}</p>}
         </div>

         <div>
           <label className="block text-sm mb-1">Blood Group</label>
           <select {...register('blood_group', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm">
             <option value="">Select blood group</option>
             {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => (
               <option key={group} value={group}>{group}</option>
             ))}
           </select>
           {errors.blood_group && <p className="text-xs text-red-600 mt-1">{errors.blood_group.message}</p>}
         </div>

         <div>
           <label className="block text-sm mb-1">Contact Number</label>
           <input 
             type="tel" 
             {...register('contact', { required: true })} 
             className="w-full rounded-md border px-3 py-2 text-sm" 
             placeholder="Enter your contact number"
           />
           {errors.contact && <p className="text-xs text-red-600 mt-1">{errors.contact.message}</p>}
         </div>

         <div>
           <label className="block text-sm mb-1">Address</label>
           <textarea 
             {...register('address', { required: true })} 
             className="w-full rounded-md border px-3 py-2 text-sm" 
             placeholder="Enter your address"
             rows="3"
           />
           {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
         </div>

         <div>
           <label className="block text-sm mb-1">City</label>
           <input 
             {...register('city', { required: true })} 
             className="w-full rounded-md border px-3 py-2 text-sm" 
             placeholder="Enter your city"
           />
           {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
         </div>

         <div>
           <label className="block text-sm mb-1">State</label>
           <input 
             {...register('state', { required: true })} 
             className="w-full rounded-md border px-3 py-2 text-sm" 
             placeholder="Enter your state"
           />
           {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
         </div>

         <div>
           <label className="block text-sm mb-1">Pincode</label>
           <input 
             {...register('pincode', { required: true })} 
             className="w-full rounded-md border px-3 py-2 text-sm" 
             placeholder="Enter your pincode"
           />
           {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode.message}</p>}
         </div>

         <div>
           <label className="block text-sm mb-1">Role</label>
           <select {...register('role', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm">
             <option value="">Select your role</option>
             <option value="Donor">Blood Donor</option>
             <option value="Patient">Patient</option>
             <option value="Hospital">Hospital</option>
           </select>
           {errors.role && <p className="text-xs text-red-600 mt-1">Please select a role</p>}
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

        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input 
            type="password" 
            {...register('confirmPassword', { required: true })} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
        </div>

         <div className="md:col-span-2">
           <button 
             disabled={isSubmitting} 
             type="submit" 
             className="w-full rounded-md bg-red-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-red-600 disabled:opacity-60"
           >
             {isSubmitting ? 'Creating Account...' : 'Sign Up'}
           </button>
         </div>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account? 
        <button onClick={() => navigate('/login')} className="text-red-500 hover:underline ml-1">
          Sign In
        </button>
      </p>
    </div>
  )
}

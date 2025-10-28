import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(18, 'Age must be at least 18').max(65, 'Age must be at most 65'),
  bloodGroup: z.string().min(1, 'Please select a blood group'),
  contact: z.string().min(10, 'Contact number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
})

export default function DonorRegistration() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: { bloodGroup: '' },
  })
  const navigate = useNavigate()
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (data) => {
    try {
      setError('')
      setSuccess('')
      
      // Create donor profile using the current user's ID
      const response = await apiService.createDonor({
        user_id: user?.user_id,
        name: data.name,
        age: data.age,
        gender: 'Other', // Default gender, can be updated later
        blood_group: data.bloodGroup,
        contact: data.contact,
        address: data.address,
        city: 'Unknown', // Default values, can be updated later
        state: 'Unknown',
        pincode: '000000'
      })

      if (response) {
        setSuccess('Donor registration completed successfully!')
        reset()
        setTimeout(() => {
          navigate('/donor-dashboard')
        }, 2000)
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="container-responsive py-12">
      <h1 className="text-2xl font-semibold mb-6">Donor Registration</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit((values) => onSubmit(schema.parse(values)))} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input {...register('name', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.name && <p className="text-xs text-red-600 mt-1">Name is required</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Age</label>
          <input type="number" {...register('age', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.age && <p className="text-xs text-red-600 mt-1">Age 18-65</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Blood Group</label>
          <select {...register('bloodGroup', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Select</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {errors.bloodGroup && <p className="text-xs text-red-600 mt-1">Select blood group</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Contact</label>
          <input {...register('contact', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.contact && <p className="text-xs text-red-600 mt-1">{errors.contact.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Address</label>
          <textarea {...register('address', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm" rows="3" />
          {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
        </div>
        <div className="md:col-span-2">
          <button disabled={isSubmitting} type="submit" className="rounded-md bg-red-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-red-600 disabled:opacity-60">{isSubmitting ? 'Submitting...' : 'Register'}</button>
        </div>
      </form>
    </div>
  )
}

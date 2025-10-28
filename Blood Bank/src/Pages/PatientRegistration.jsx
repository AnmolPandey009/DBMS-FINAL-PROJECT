import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1).max(120, 'Age must be between 1 and 120'),
  bloodGroup: z.string().min(1, 'Please select a blood group'),
  contact: z.string().min(10, 'Contact number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  medicalHistory: z.string().optional(),
  emergencyContact: z.string().min(10, 'Emergency contact must be at least 10 digits'),
})

export default function PatientRegistration() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (data) => {
    try {
      setError('')
      setSuccess('')
      
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          age: data.age,
          blood_group: data.bloodGroup,
          contact_number: data.contact,
          address: data.address,
          medical_history: data.medicalHistory || '',
          emergency_contact: data.emergencyContact,
        }),
      })

      if (response.ok) {
        setSuccess('Patient registration completed successfully!')
        reset()
        setTimeout(() => {
          navigate('/patient-dashboard')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="container-responsive py-12">
      <h1 className="text-2xl font-semibold mb-6">Patient Registration</h1>
      
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

      <form onSubmit={handleSubmit((values) => onSubmit(schema.parse(values)))} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
        <div>
          <label className="block text-sm mb-1">Full Name *</label>
          <input 
            {...register('name', { required: true })} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Enter patient's full name"
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Age *</label>
          <input 
            type="number" 
            {...register('age', { required: true })} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Enter patient's age"
            min="1"
            max="120"
          />
          {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Blood Group *</label>
          <select {...register('bloodGroup', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Select Blood Group</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          {errors.bloodGroup && <p className="text-xs text-red-600 mt-1">{errors.bloodGroup.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Contact Number *</label>
          <input 
            type="tel" 
            {...register('contact', { required: true })} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Enter contact number"
          />
          {errors.contact && <p className="text-xs text-red-600 mt-1">{errors.contact.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Emergency Contact *</label>
          <input 
            type="tel" 
            {...register('emergencyContact', { required: true })} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Enter emergency contact number"
          />
          {errors.emergencyContact && <p className="text-xs text-red-600 mt-1">{errors.emergencyContact.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Address *</label>
          <textarea 
            {...register('address', { required: true })} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Enter complete address"
            rows="3"
          />
          {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Medical History</label>
          <textarea 
            {...register('medicalHistory')} 
            className="w-full rounded-md border px-3 py-2 text-sm" 
            placeholder="Enter any relevant medical history (optional)"
            rows="3"
          />
        </div>

        <div className="md:col-span-2 flex gap-4">
          <button 
            disabled={isSubmitting} 
            type="submit" 
            className="rounded-md bg-red-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-red-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Registering...' : 'Register Patient'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/patient-dashboard')}
            className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

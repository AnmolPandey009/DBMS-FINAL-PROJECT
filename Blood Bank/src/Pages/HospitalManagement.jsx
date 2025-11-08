import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  hospitalName: z.string().min(2, 'Hospital name must be at least 2 characters'),
  licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  emergencyContact: z.string().min(10, 'Emergency contact must be at least 10 digits'),
  specialties: z.string().optional(),
})

export default function HospitalManagement() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [hospital, setHospital] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'hospital') {
      navigate('/dashboard')
      return
    }

    setUser(parsedUser)
    fetchHospitalData()
  }, [navigate])

  const fetchHospitalData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/hospitals/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const hospitalData = await response.json()
        setHospital(hospitalData)
        
        // Pre-fill form with existing data
        setValue('hospitalName', hospitalData.hospital_name || '')
        setValue('licenseNumber', hospitalData.license_number || '')
        setValue('address', hospitalData.address || '')
        setValue('contactNumber', hospitalData.contact_number || '')
        setValue('email', hospitalData.email || '')
        setValue('emergencyContact', hospitalData.emergency_contact || '')
        setValue('specialties', hospitalData.specialties || '')
      }
    } catch (error) {
      console.error('Error fetching hospital data:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setError('')
      setSuccess('')
      
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/hospitals/${hospital?.hospital_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospital_name: data.hospitalName,
          license_number: data.licenseNumber,
          address: data.address,
          contact_number: data.contactNumber,
          email: data.email,
          emergency_contact: data.emergencyContact,
          specialties: data.specialties || '',
        }),
      })

      if (response.ok) {
        setSuccess('Hospital information updated successfully!')
        fetchHospitalData() // Refresh data
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Update failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="container-responsive py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container-responsive py-12 mx-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Hospital Management</h1>
        <button 
          onClick={() => navigate('/hospital-dashboard')}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
      
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

      {/* Hospital Status */}
      {hospital && (
        <div className="mb-6 rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Hospital Name</div>
              <div className="font-medium">{hospital.hospital_name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">License Number</div>
              <div className="font-medium">{hospital.license_number}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                hospital.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {hospital.is_approved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Registration Date</div>
              <div className="font-medium">
                {new Date(hospital.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Form */}
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Update Hospital Information</h2>
        
        <form onSubmit={handleSubmit((values) => onSubmit(schema.parse(values)))} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm mb-1">Hospital Name *</label>
            <input 
              {...register('hospitalName', { required: true })} 
              className="w-full rounded-md border px-3 py-2 text-sm" 
              placeholder="Enter hospital name"
            />
            {errors.hospitalName && <p className="text-xs text-red-600 mt-1">{errors.hospitalName.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">License Number *</label>
            <input 
              {...register('licenseNumber', { required: true })} 
              className="w-full rounded-md border px-3 py-2 text-sm" 
              placeholder="Enter license number"
            />
            {errors.licenseNumber && <p className="text-xs text-red-600 mt-1">{errors.licenseNumber.message}</p>}
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

          <div>
            <label className="block text-sm mb-1">Contact Number *</label>
            <input 
              type="tel" 
              {...register('contactNumber', { required: true })} 
              className="w-full rounded-md border px-3 py-2 text-sm" 
              placeholder="Enter contact number"
            />
            {errors.contactNumber && <p className="text-xs text-red-600 mt-1">{errors.contactNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Email *</label>
            <input 
              type="email" 
              {...register('email', { required: true })} 
              className="w-full rounded-md border px-3 py-2 text-sm" 
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Emergency Contact *</label>
            <input 
              type="tel" 
              {...register('emergencyContact', { required: true })} 
              className="w-full rounded-md border px-3 py-2 text-sm" 
              placeholder="Enter emergency contact"
            />
            {errors.emergencyContact && <p className="text-xs text-red-600 mt-1">{errors.emergencyContact.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Medical Specialties</label>
            <input 
              {...register('specialties')} 
              className="w-full rounded-md border px-3 py-2 text-sm" 
              placeholder="e.g., Cardiology, Emergency Medicine"
            />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button 
              disabled={isSubmitting} 
              type="submit" 
              className="rounded-md bg-blue-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-600 disabled:opacity-60"
            >
              {isSubmitting ? 'Updating...' : 'Update Information'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/hospital-dashboard')}
              className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Additional Information */}
      <div className="mt-6 rounded-lg border p-4">
        <h3 className="font-semibold mb-2">Important Notes</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Changes to license number may require re-approval</li>
          <li>• Contact information updates will be verified</li>
          <li>• Emergency contact should be available 24/7</li>
          <li>• All fields marked with * are required</li>
        </ul>
      </div>
    </div>
  )
}

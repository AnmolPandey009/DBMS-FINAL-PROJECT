import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  bloodGroup: z.string().min(1, 'Please select a blood group'),
  unitsRequired: z.coerce.number().min(1, 'Units required must be at least 1').max(10, 'Maximum 10 units per request'),
  urgency: z.enum(['low', 'medium', 'high', 'critical'], { required_error: 'Please select urgency level' }),
  reason: z.string().min(10, 'Please provide a detailed reason for the blood request').max(500, 'Reason must be less than 500 characters'),
  doctorName: z.string().min(2, 'Doctor name must be at least 2 characters').max(100, 'Doctor name must be less than 100 characters'),
  doctorContact: z.string().min(10, 'Doctor contact must be at least 10 characters').max(20, 'Doctor contact must be less than 20 characters'),
  hospitalId: z.string().min(1, 'Please select a hospital'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
})

export default function BloodRequest() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchHospitals()
  }, [navigate])

  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/hospitals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setHospitals(result.data)
        }
      } else {
        console.error('Failed to fetch hospitals:', response.status)
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error)
    } finally {
      setLoading(false)
    }
  }

  // const onSubmit = async (data) => {
  //   try {
  //     setError('')
  //     setSuccess('')

  //     const token = localStorage.getItem('token')
  //     const response = await fetch('http://localhost:5000/api/requests', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         patient_id: user.user_id,
  //         patient_name: user.name,
  //         blood_group: data.bloodGroup,
  //         component_type: 'Whole Blood', // Default to whole blood
  //         units_requested: data.unitsRequired,
  //         urgency: data.urgency,
  //         hospital_id: null, // Will be handled by hospital name lookup if needed
  //         request_date: new Date().toISOString().split('T')[0],
  //         required_by_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  //         notes: data.notes || '',
  //       }),
  //     })

  //     console.log(response);

  //     if (response.ok) {
  //       setSuccess('Blood request submitted successfully!')
  //       reset()
  //       setTimeout(() => {
  //         const userRole = user?.role?.toLowerCase()
  //         if (userRole === 'patient') {
  //           navigate('/patient-dashboard')
  //         } else if (userRole === 'hospital') {
  //           navigate('/hospital-dashboard')
  //         } else {
  //           navigate('/dashboard')
  //         }
  //       }, 2000)
  //     } else {
  //       const errorData = await response.json()
  //       setError(errorData.message || 'Request submission failed')
  //     }
  //   } catch (err) {
  //     setError('Network error. Please try again.')
  //   }
  // }

  const onSubmit = async (data) => {
    try {
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: user.id, // Use user.id from auth context
          hospital_id: parseInt(data.hospitalId),
          blood_group: data.bloodGroup,
          units_requested: data.unitsRequired,
          urgency: data.urgency,
          reason: data.reason,
          doctor_name: data.doctorName,
          doctor_contact: data.doctorContact,
          notes: data.notes || null,
        }),
      })

      const responseData = await response.json()
      console.log('Response status:', response.status)
      console.log('Response data:', responseData)

      if (response.ok) {
        setSuccess(responseData.message || 'Blood request submitted successfully!')
        reset()
        setTimeout(() => {
          const userRole = user?.role?.toLowerCase()
          if (userRole === 'patient') {
            navigate('/patient-dashboard')
          } else if (userRole === 'hospital') {
            navigate('/hospital-dashboard')
          } else {
            navigate('/dashboard')
          }
        }, 2000)
      } else {
        setError(responseData.message || 'Request submission failed')
      }
    } catch (err) {
      console.error('Request error:', err)
      setError('Network error. Please try again.')
    }
  }




  if (!user || loading) {
    return (
      <div className="container-responsive py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container-responsive py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Blood Request</h1>
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back
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

      <form onSubmit={handleSubmit((values) => onSubmit(schema.parse(values)))} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
        {/* Blood Group */}
        <div>
          <label className="block text-sm mb-1">Blood Group Required *</label>
          <select {...register('bloodGroup', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Select Blood Group</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          {errors.bloodGroup && <p className="text-xs text-red-600 mt-1">{errors.bloodGroup.message}</p>}
        </div>

        {/* Units Required */}
        <div>
          <label className="block text-sm mb-1">Units Required *</label>
          <input
            type="number"
            {...register('unitsRequired', { required: true })}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Enter number of units (1-10)"
            min="1"
            max="10"
          />
          {errors.unitsRequired && <p className="text-xs text-red-600 mt-1">{errors.unitsRequired.message}</p>}
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-sm mb-1">Urgency Level *</label>
          <select {...register('urgency', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Select Urgency</option>
            <option value="low">Low - Can wait 1-2 days</option>
            <option value="medium">Medium - Needed within 24 hours</option>
            <option value="high">High - Emergency - Needed immediately</option>
            <option value="critical">Critical - Life-threatening emergency</option>
          </select>
          {errors.urgency && <p className="text-xs text-red-600 mt-1">{errors.urgency.message}</p>}
        </div>

        {/* Hospital Selection */}
        <div>
          <label className="block text-sm mb-1">Select Hospital *</label>
          <select {...register('hospitalId', { required: true })} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Select Hospital</option>
            {hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.hospital_name} - {hospital.address}
              </option>
            ))}
          </select>
          {errors.hospitalId && <p className="text-xs text-red-600 mt-1">{errors.hospitalId.message}</p>}
        </div>

        {/* Doctor Name */}
        <div>
          <label className="block text-sm mb-1">Doctor Name *</label>
          <input
            {...register('doctorName', { required: true })}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Enter doctor's full name"
            maxLength="100"
          />
          {errors.doctorName && <p className="text-xs text-red-600 mt-1">{errors.doctorName.message}</p>}
        </div>

        {/* Doctor Contact */}
        <div>
          <label className="block text-sm mb-1">Doctor Contact *</label>
          <input
            {...register('doctorContact', { required: true })}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Enter doctor's phone number"
            maxLength="20"
          />
          {errors.doctorContact && <p className="text-xs text-red-600 mt-1">{errors.doctorContact.message}</p>}
        </div>

        {/* Reason for Request */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Reason for Blood Request *</label>
          <textarea
            {...register('reason', { required: true })}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Please provide a detailed reason for the blood request (minimum 10 characters)"
            rows="3"
            maxLength="500"
          />
          {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason.message}</p>}
        </div>

        {/* Additional Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Additional Notes</label>
          <textarea
            {...register('notes')}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Enter any additional information about the request (optional)"
            rows="3"
            maxLength="500"
          />
          {errors.notes && <p className="text-xs text-red-600 mt-1">{errors.notes.message}</p>}
        </div>

        <div className="md:col-span-2 flex gap-4">
          <button
            disabled={isSubmitting}
            type="submit"
            className="rounded-md bg-red-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-red-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Available Blood Inventory Preview */}
      <div className="mt-8 rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Current Blood Inventory</h2>
        <div className="text-sm text-gray-600 mb-2">
          Check available blood units before submitting your request
        </div>
        <button
          onClick={() => navigate('/blood-inventory')}
          className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600"
        >
          View Full Inventory
        </button>
      </div>
    </div>
  )
}

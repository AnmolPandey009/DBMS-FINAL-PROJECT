import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

export default function ProfileEditForm() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        let response
        if (user?.role === 'donor') {
          response = await apiService.getDonorProfile()
        } else if (user?.role === 'patient') {
          response = await apiService.getPatientProfile()
        } else if (user?.role === 'hospital') {
          response = await apiService.getHospitalProfile()
        }
        const data = response?.data ?? response ?? {}
        setForm(data)
      } catch (e) {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.role])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      // Limit payload to editable fields per role
      const pick = (obj, keys) => keys.reduce((acc, k) => (obj[k] !== undefined ? (acc[k] = obj[k], acc) : acc), {})

      let res
      if (user?.role === 'donor') {
        const donorId = form.id || form.donor_id
        if (!donorId) {
          setError('Donor profile not found. Please complete donor registration first.')
          return
        }
        const editable = ['first_name','last_name','date_of_birth','gender','blood_group','phone','address','emergency_contact','medical_history']
        const payload = pick(form, editable)
        res = await apiService.updateDonor(donorId, payload)
      } else if (user?.role === 'patient') {
        const patientId = form.id || form.patient_id
        if (!patientId) {
          setError('Patient profile not found. Please complete patient registration first.')
          return
        }
        const editable = ['first_name','last_name','date_of_birth','gender','blood_group','phone','address','emergency_contact','medical_history']
        const payload = pick(form, editable)
        res = await apiService.updatePatient(patientId, payload)
      } else if (user?.role === 'hospital') {
        const hospitalId = form.id || form.hospital_id
        if (!hospitalId) {
          setError('Hospital profile not found. Please complete hospital setup first.')
          return
        }
        const editable = ['hospital_name','license_number','address','phone','email','contact_person']
        const payload = pick(form, editable)
        res = await apiService.updateHospital(hospitalId, payload)
      }

      if (res && (res.success !== false)) {
        setSuccess('Profile updated successfully!')
        // reflect basics in auth user object if present
        updateUser({ ...user, ...form })
        setTimeout(() => navigate(-1), 1000)
      } else {
        setError(res?.message || 'Failed to update profile')
      }
    } catch (err) {
      setError('Update failed. Please try again.')
    }
  }

  if (loading) return <div className="container-responsive py-12"><div className="text-center">Loading...</div></div>

  const readOnlyKeys = new Set(['id','donor_id','patient_id','hospital_id','user_id','role'])

  const editableKeysByRole = {
    donor: ['first_name','last_name','date_of_birth','gender','blood_group','phone','address','emergency_contact','medical_history'],
    patient: ['first_name','last_name','date_of_birth','gender','blood_group','phone','address','emergency_contact','medical_history'],
    hospital: ['hospital_name','license_number','address','phone','email','contact_person']
  }
  const allowedKeys = editableKeysByRole[user?.role] || []

  return (
    <div className="container-responsive py-12 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
        <button onClick={() => navigate(-1)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Back</button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
        {Object.entries(form).map(([key, value]) => (
          (!allowedKeys.includes(key) || readOnlyKeys.has(key)) ? null : (
            <div key={key}>
              <label className="block text-sm mb-1">{key.replace(/_/g, ' ')}</label>
              <input
                name={key}
                value={value ?? ''}
                onChange={onChange}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          )
        ))}
        <div className="mt-2">
          <button type="submit" className="rounded-md bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700">Save Changes</button>
        </div>
      </form>
    </div>
  )
}



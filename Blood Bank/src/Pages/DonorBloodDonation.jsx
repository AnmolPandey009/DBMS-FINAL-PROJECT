import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

export default function DonorBloodDonation() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    blood_group: '',
    units: '',
    donation_date: '',
    donation_time: '',
    blood_bank_location: '',
    hemoglobin_level: '',
    notes: ''
  })

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const payload = {
        blood_group: form.blood_group,
        units_donated: Number(form.units),
        donation_date: form.donation_date,
        hemoglobin_level: form.hemoglobin_level || null,
        blood_pressure: null,
        temperature: null,
        notes: form.notes || null
      }
      const res = await apiService.createDonationRequest(payload)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess('Blood donation request submitted successfully! It will be reviewed by hospital staff.')
        setForm({
          blood_group: '', units: '', donation_date: '', donation_time: '', blood_bank_location: '', hemoglobin_level: '', notes: ''
        })
      }
    } catch (err) {
      setError('Failed to submit donation request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-responsive py-12 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Blood Donation Request</h1>
        <button onClick={() => navigate(-1)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Back</button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your donation request will be reviewed by hospital staff before approval. 
          You will be notified once it's approved and can proceed with the donation.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Blood Group</label>
          <select name="blood_group" value={form.blood_group} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" required>
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Units to Donate</label>
          <input name="units" type="number" min="1" max="2" value={form.units} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Preferred Donation Date</label>
          <input name="donation_date" type="date" value={form.donation_date} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Preferred Time (optional)</label>
          <input name="donation_time" type="time" value={form.donation_time} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm mb-1">Preferred Blood Bank Location (optional)</label>
          <input name="blood_bank_location" type="text" value={form.blood_bank_location} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm mb-1">Hemoglobin Level (optional)</label>
          <input name="hemoglobin_level" type="text" value={form.hemoglobin_level} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g., 12.5" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Additional Notes (optional)</label>
          <textarea name="notes" value={form.notes} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" rows="3" placeholder="Any special requirements or notes..." />
        </div>
        <div className="md:col-span-2 mt-2">
          <button disabled={submitting} type="submit" className="rounded-md bg-red-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-red-700 disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit Donation Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

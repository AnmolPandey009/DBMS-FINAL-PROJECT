import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

export default function AddInventory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    blood_group: '',
    component_type: '',
    units_available: '',
    expiry_date: '',
    storage_location: '',
    donated_by: '',
    donation_date: ''
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
        component_type: form.component_type,
        units_available: Number(form.units_available),
        expiry_date: form.expiry_date,
        storage_location: form.storage_location || null,
        donated_by: form.donated_by ? Number(form.donated_by) : null,
        donation_date: form.donation_date || null
      }
      const res = await apiService.addBloodToInventory(payload)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess('Inventory added successfully')
        // reset minimal fields
        setForm((prev) => ({
          ...prev,
          units_available: '',
          expiry_date: '',
          storage_location: '',
          donated_by: '',
          donation_date: ''
        }))
        // Optional: navigate to inventory list
        // navigate('/blood-inventory')
      }
    } catch (err) {
      setError('Failed to add inventory. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-responsive py-12 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Add Inventory</h1>
        <button onClick={() => navigate(-1)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Back</button>
      </div>

      {user?.role && (
        <p className="text-sm text-gray-600 mb-4">Signed in as: {user.role}</p>
      )}

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
          <label className="block text-sm mb-1">Component Type</label>
          <select name="component_type" value={form.component_type} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" required>
            <option value="">Select</option>
            <option value="Whole Blood">Whole Blood</option>
            <option value="Plasma">Plasma</option>
            <option value="Platelets">Platelets</option>
            <option value="RBC">RBC</option>
            <option value="FFP">FFP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Units</label>
          <input name="units_available" type="number" min="1" value={form.units_available} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" required />
        </div>

        <div>
          <label className="block text-sm mb-1">Expiry Date</label>
          <input name="expiry_date" type="date" value={form.expiry_date} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" required />
        </div>

        <div>
          <label className="block text-sm mb-1">Storage Location</label>
          <input name="storage_location" type="text" value={form.storage_location} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Rack / Shelf" />
        </div>

        <div>
          <label className="block text-sm mb-1">Donated By (Donor ID)</label>
          <input name="donated_by" type="number" min="0" value={form.donated_by} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Optional" />
        </div>

        <div>
          <label className="block text-sm mb-1">Donation Date</label>
          <input name="donation_date" type="date" value={form.donation_date} onChange={onChange} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Optional" />
        </div>

        <div className="md:col-span-2 mt-2">
          <button disabled={submitting} type="submit" className="rounded-md bg-green-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-60">
            {submitting ? 'Adding...' : 'Add to Inventory'}
          </button>
        </div>
      </form>
    </div>
  )
}



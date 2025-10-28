import { useState } from 'react'
import apiService from '../services/api'

export default function BloodIssueForm({ request, onClose, onSuccess }) {
  const [form, setForm] = useState({
    request_id: request?.id || '',
    blood_group: request?.blood_group || '',
    units_issued: request?.units_requested || '',
    issued_to: request?.patient_first_name + ' ' + request?.patient_last_name || '',
    issued_by: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
        request_id: parseInt(form.request_id),
        blood_group: form.blood_group,
        units_issued: parseFloat(form.units_issued),
        issued_to: form.issued_to,
        issued_by: form.issued_by,
        notes: form.notes || null
      }

      const res = await apiService.createIssue(payload)
      
      if (res.success) {
        setSuccess('Blood issued successfully!')
        setTimeout(() => {
          onSuccess && onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(res.message || 'Failed to issue blood')
      }
    } catch (err) {
      setError('Failed to issue blood. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Issue Blood</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request ID
            </label>
            <input
              type="text"
              name="request_id"
              value={form.request_id}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <input
              type="text"
              name="blood_group"
              value={form.blood_group}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Units to Issue
            </label>
            <input
              type="number"
              name="units_issued"
              value={form.units_issued}
              onChange={onChange}
              min="0.1"
              step="0.1"
              max={request?.units_requested}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {request?.units_requested} units
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issued To
            </label>
            <input
              type="text"
              name="issued_to"
              value={form.issued_to}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issued By (Staff Name)
            </label>
            <input
              type="text"
              name="issued_by"
              value={form.issued_by}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Enter staff member name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Issuing...' : 'Issue Blood'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

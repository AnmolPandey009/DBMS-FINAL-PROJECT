import { useState } from 'react'

export default function RequestCard({ request, onApprove, onReject, onViewDetails, userRole }) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await onApprove(request)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      await onReject(request)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canApprove = userRole === 'admin' || userRole === 'hospital'
  const canReject = userRole === 'admin' || userRole === 'hospital'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold">
              {request.blood_group}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">
                {request.hospital_name || 'Blood Request'}
              </h3>
              <p className="text-sm text-gray-600">
                Requested by: {request.patient_name || 'Unknown Patient'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{request.units_required}</div>
          <div className="text-xs text-gray-500">units</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Urgency:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
            {request.urgency}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Request Date:</span>
          <span className="font-medium">{new Date(request.created_at).toLocaleDateString()}</span>
        </div>
        
        {request.doctor_name && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Doctor:</span>
            <span className="font-medium">{request.doctor_name}</span>
          </div>
        )}
      </div>

      {request.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-700">
            <strong>Notes:</strong> {request.notes}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {canApprove && request.status === 'pending' && (
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
        )}
        
        {canReject && request.status === 'pending' && (
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
        )}
        
        <button
          onClick={() => onViewDetails(request)}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Details
        </button>
      </div>

      {request.status === 'approved' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-green-600">
            ✅ Request approved and ready for fulfillment
          </div>
        </div>
      )}
      
      {request.status === 'rejected' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-red-600">
            ❌ Request has been rejected
          </div>
        </div>
      )}
    </div>
  )
}

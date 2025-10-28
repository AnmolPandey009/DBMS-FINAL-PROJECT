import { useState } from 'react'

export default function BloodCard({ bloodItem, onReserve, onViewDetails }) {
  const [isReserving, setIsReserving] = useState(false)

  const handleReserve = async () => {
    setIsReserving(true)
    try {
      await onReserve(bloodItem)
    } finally {
      setIsReserving(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
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

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= 7 && diffDays > 0
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold">
              {bloodItem.blood_group}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">{bloodItem.component_type || 'Whole Blood'}</h3>
              <p className="text-sm text-gray-600">{bloodItem.location || 'Main Storage'}</p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{bloodItem.units_available}</div>
          <div className="text-xs text-gray-500">units</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bloodItem.status)}`}>
            {bloodItem.status}
          </span>
        </div>
        
        {bloodItem.expiry_date && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Expiry:</span>
            <span className={`font-medium ${
              isExpiringSoon(bloodItem.expiry_date) ? 'text-orange-600' : 'text-gray-900'
            }`}>
              {new Date(bloodItem.expiry_date).toLocaleDateString()}
              {isExpiringSoon(bloodItem.expiry_date) && (
                <span className="ml-1 text-xs text-orange-600">⚠️</span>
              )}
            </span>
          </div>
        )}
        
        {bloodItem.collection_date && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Collected:</span>
            <span className="font-medium">{new Date(bloodItem.collection_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleReserve}
          disabled={bloodItem.status !== 'available' || isReserving}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            bloodItem.status === 'available'
              ? 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isReserving ? 'Reserving...' : 'Reserve'}
        </button>
        
        <button
          onClick={() => onViewDetails(bloodItem)}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Details
        </button>
      </div>

      {bloodItem.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <strong>Notes:</strong> {bloodItem.notes}
          </div>
        </div>
      )}
    </div>
  )
}

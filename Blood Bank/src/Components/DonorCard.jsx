import { useState } from 'react'

export default function DonorCard({ donor, onRequestBlood, onViewProfile }) {
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequestBlood = async () => {
    setIsRequesting(true)
    try {
      await onRequestBlood(donor)
    } finally {
      setIsRequesting(false)
    }
  }

  const getLastDonationText = (lastDonation) => {
    if (!lastDonation) return 'Never donated'
    
    const donationDate = new Date(lastDonation)
    const now = new Date()
    const diffTime = Math.abs(now - donationDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const canDonate = (lastDonation) => {
    if (!lastDonation) return true
    
    const donationDate = new Date(lastDonation)
    const now = new Date()
    const diffTime = Math.abs(now - donationDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Minimum 56 days between donations
    return diffDays >= 56
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{donor.name}</h3>
          <p className="text-sm text-gray-600">{donor.city}</p>
        </div>
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold text-lg">
            {donor.blood_group}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Age:</span>
          <span className="font-medium">{donor.age} years</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Last Donation:</span>
          <span className="font-medium">{getLastDonationText(donor.last_donation)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <span className={`font-medium ${
            canDonate(donor.last_donation) ? 'text-green-600' : 'text-orange-600'
          }`}>
            {canDonate(donor.last_donation) ? 'Available' : 'Not Available'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleRequestBlood}
          disabled={!canDonate(donor.last_donation) || isRequesting}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            canDonate(donor.last_donation)
              ? 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRequesting ? 'Requesting...' : 'Request Blood'}
        </button>
        
        <button
          onClick={() => onViewProfile(donor)}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          View
        </button>
      </div>

      {donor.contact_number && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Contact: {donor.contact_number}
          </div>
        </div>
      )}
    </div>
  )
}

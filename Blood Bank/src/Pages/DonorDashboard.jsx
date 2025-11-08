import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

export default function DonorDashboard() {
  const { user } = useAuth()
  const [donor, setDonor] = useState(null)
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // useEffect(() => {
  //   if (user?.role !== 'donor') {
  //     navigate('/dashboard')
  //     return
  //   }
  //   fetchDonorData()
  // }, [user, navigate])
  // useEffect(() => {
  //   console.log('Current user:', user)
  //   if (user?.role !== 'donor') {
  //     navigate('/dashboard')
  //     return
  //   }
  //   fetchDonorData()
  // }, [user, navigate])
  useEffect(() => {
    if (user === undefined) {
      // Your auth may be loading user info asynchronously
      setLoading(true)
      return
    }

    if (user && user.role?.toLowerCase() === 'donor') {
      fetchDonorData()
    } else if (user && user.role?.toLowerCase() !== 'donor') {
      navigate('/dashboard')
    } else {
      setLoading(false)
    }
  }, [user, navigate])



  // const fetchDonorData = async () => {
  //   try {
  //     setLoading(true)

  //     // Fetch donor profile
  //     const donorResponse = await apiService.getDonorProfile()
  //     if (donorResponse) {
  //       setDonor(donorResponse)
  //     }

  //     // Fetch donation history
  //     const donationsResponse = await apiService.getDonationsByDonor(donorResponse?.donor_id)
  //     if (donationsResponse) {
  //       setDonations(donationsResponse)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching donor data:', error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const fetchDonorData = async () => {
    try {
      setLoading(true)

      // Fetch donor profile
      const donorResponse = await apiService.getDonorProfile()
      console.log('Donor response:', donorResponse) // Debug

      const profile = donorResponse?.data ?? donorResponse
      if (profile) {
        setDonor(profile)
      }

      // Fetch donation history
      const donorId = profile?.id ?? profile?.donor_id
      const donationsResponse = await apiService.getDonationsByDonor(donorId)
      console.log('Donations response:', donationsResponse) // Debug

      // Handle different response formats
      if (donationsResponse) {
        if (Array.isArray(donationsResponse)) {
          setDonations(donationsResponse)
        } else if (Array.isArray(donationsResponse.data)) {
          setDonations(donationsResponse.data)
        } else if (donationsResponse.donations && Array.isArray(donationsResponse.donations)) {
          setDonations(donationsResponse.donations)
        } else {
          setDonations([])
        }
      } else {
        setDonations([])
      }
    } catch (error) {
      console.error('Error fetching donor data:', error)
      setDonations([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
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

  const getAgeFromDob = (dob) => {
    if (!dob) return ''
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getNextDonationDate = (lastDonation) => {
    if (!lastDonation) return null

    const donationDate = new Date(lastDonation)
    const nextDonationDate = new Date(donationDate.getTime() + (56 * 24 * 60 * 60 * 1000))
    return nextDonationDate
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
        <h1 className="text-2xl font-semibold">Donor Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/profile/edit')}
            className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600"
          >
            Update Profile
          </button>
          <button
            onClick={() => navigate('/blood-inventory')}
            className="rounded-md bg-green-500 text-white px-4 py-2 text-sm hover:bg-green-600"
          >
            View Inventory
          </button>
          <button
            onClick={() => navigate('/donor-blood-donation')}
            className="rounded-md bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
          >
            Request Blood Donation
          </button>
        </div>
      </div>

      {/* Donor Information */}
      {donor && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-600">Blood Group</div>
            <div className="text-2xl font-semibold flex items-center">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-lg mr-2">
                {donor.blood_group}
              </span>

            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-600">Total Donations</div>
            <div className="text-2xl font-semibold">{donations.length}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-600">Donation Status</div>
            <div className="text-lg font-semibold">
              <span className={`px-2 py-1 rounded text-xs font-medium ${canDonate(donor.last_donation_date) ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                {canDonate(donor.last_donation_date) ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donor Profile */}
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          {donor ? (
            <div className="space-y-2">
              <div><strong>Name:</strong> {donor.first_name} {donor.last_name}</div>
              <div><strong>Age:</strong> {getAgeFromDob(donor.date_of_birth)} years</div>
              <div><strong>Blood Group:</strong> {donor.blood_group}</div>
              <div><strong>Contact:</strong> {donor.phone}</div>
              <div><strong>Address:</strong> {donor.address}</div>
              <div><strong>Last Donation:</strong> {
                donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'
              }</div>
              {donor.last_donation_date && !canDonate(donor.last_donation_date) && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                  <div className="text-sm text-orange-800">
                    <strong>Next donation available:</strong> {
                      getNextDonationDate(donor.last_donation_date)?.toLocaleDateString()
                    }
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No donor profile found. Please complete your registration.
            </div>
          )}
        </div>

        {/* Donation History */}
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Donation History</h2>
          {donations.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No donation history yet
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {donations.map((donation) => (
                <div key={donation.donation_id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {donation.units_donated} units donated
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(donation.donation_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Location: {donation.location || 'Main Center'}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {donation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/profile/edit')}
            className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600"
          >
            Update Profile
          </button>
          <button
            onClick={() => navigate('/blood-inventory')}
            className="rounded-md bg-green-500 text-white px-4 py-2 text-sm hover:bg-green-600"
          >
            View Blood Inventory
          </button>
          <button
            onClick={() => navigate('/donor-blood-donation')}
            className="rounded-md bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
          >
            Request Blood Donation
          </button>
          <button
            onClick={() => navigate('/blood-requests')}
            className="rounded-md bg-purple-500 text-white px-4 py-2 text-sm hover:bg-purple-600"
          >
            View Blood Requests
          </button>
        </div>
      </div>
    </div>
  )
}

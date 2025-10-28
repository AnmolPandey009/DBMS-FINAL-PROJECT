import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api'
import RequestCard from '../components/RequestCard'

export default function BloodRequests() {
  const [requests, setRequests] = useState([])
  const [donors, setDonors] = useState([])
  const [bloodGroup, setBloodGroup] = useState('')
  const [city, setCity] = useState('')
  const [urgency, setUrgency] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch blood requests
      const requestsResponse = await apiService.getAllRequests()
      // Ensure requests is always an array
      console.log("Requests Response:", requestsResponse);
      setRequests(Array.isArray(requestsResponse?.data) ? requestsResponse : [])

      // Fetch donors for blood group filtering
      const donorsResponse = await apiService.getAllDonors()
      // Ensure donors is always an array
      console.log("Donors Response:", donorsResponse);
      setDonors(Array.isArray(donorsResponse?.data) ? donorsResponse : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      // Set empty arrays on error to prevent filter/map errors
      setRequests([])
      setDonors([])
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = Array.isArray(requests?.data) ? requests?.data?.filter((request) => {
    const matchesBloodGroup = !bloodGroup || request.blood_group === bloodGroup
    const matchesUrgency = !urgency || request.urgency === urgency
    return matchesBloodGroup && matchesUrgency
  }) : []

  const handleApproveRequest = async (request) => {
    try {
      await apiService.updateRequestStatus(request.request_id, 'approved')
      setRequests(Array.isArray(requests) ? requests.map(r => 
        r.request_id === request.request_id ? { ...r, status: 'approved' } : r
      ) : [])
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleRejectRequest = async (request) => {
    try {
      await apiService.updateRequestStatus(request.request_id, 'rejected')
      setRequests(Array.isArray(requests) ? requests.map(r => 
        r.request_id === request.request_id ? { ...r, status: 'rejected' } : r
      ) : [])
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const handleViewDetails = (request) => {
    // Navigate to request details page or show modal
    console.log('View details for request:', request)
  }

  if (loading) {
    return (
      <div className="container-responsive py-12">
        <div className="text-center">Loading blood requests...</div>
      </div>
    )
  }

  return (
    <div className="container-responsive py-12 px-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Blood Requests</h1>
        <button 
          onClick={() => navigate('/blood-request')}
          className="rounded-md bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
        >
          Create Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All Blood Groups</option>
          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All Urgency Levels</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button 
          onClick={fetchData}
          className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600"
        >
          Refresh
        </button>
        <button 
          onClick={() => navigate('/blood-inventory')}
          className="rounded-md bg-green-500 text-white px-4 py-2 text-sm hover:bg-green-600"
        >
          View Inventory
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No blood requests found
          </div>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard
              key={request.request_id}
              request={request}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onViewDetails={handleViewDetails}
              userRole="admin" // This should come from auth context
            />
          ))
        )}
      </div>
    </div>
  )
}

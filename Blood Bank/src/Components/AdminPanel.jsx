import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'admin') {
      navigate('/dashboard')
      return
    }

    fetchAllData()
  }, [navigate])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Fetch users
      const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Fetch pending hospitals
      const hospitalsResponse = await fetch('http://localhost:3000/api/admin/pending-hospitals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Fetch requests
      const requestsResponse = await fetch('http://localhost:3000/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
      
      if (hospitalsResponse.ok) {
        const hospitalsData = await hospitalsResponse.json()
        setHospitals(hospitalsData)
      }
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRequests(requestsData)
      }
    } catch (error) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const deactivateUser = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/admin/deactivate-user/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.user_id === userId ? { ...user, is_active: false } : user
        ))
        alert('User deactivated successfully')
      }
    } catch (error) {
      alert('Failed to deactivate user')
    }
  }

  const approveHospital = async (hospitalId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/hospitals/${hospitalId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setHospitals(hospitals.filter(h => h.hospital_id !== hospitalId))
        alert('Hospital approved successfully')
      }
    } catch (error) {
      alert('Failed to approve hospital')
    }
  }

  const tabs = [
    { id: 'users', label: 'Users', count: users.length },
    { id: 'hospitals', label: 'Hospitals', count: hospitals.length },
    { id: 'requests', label: 'Requests', count: requests.length },
  ]

  if (loading) {
    return (
      <div className="container-responsive py-12">
        <div className="text-center">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="container-responsive py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <button 
          onClick={() => navigate('/admin-dashboard')}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-lg border p-4">
        {activeTab === 'users' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">User Management</h2>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.user_id} className="border-b">
                        <td className="py-2">{user.name}</td>
                        <td className="py-2">{user.email}</td>
                        <td className="py-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2">
                          {user.is_active && (
                            <button
                              onClick={() => deactivateUser(user.user_id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Hospital Approvals</h2>
            {hospitals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending hospital approvals</div>
            ) : (
              <div className="space-y-4">
                {hospitals.map((hospital) => (
                  <div key={hospital.hospital_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{hospital.hospital_name}</h3>
                        <p className="text-sm text-gray-600">{hospital.address}</p>
                        <p className="text-sm text-gray-600">License: {hospital.license_number}</p>
                        <p className="text-sm text-gray-600">Contact: {hospital.contact_number}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveHospital(hospital.hospital_id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => deactivateUser(hospital.user_id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Blood Requests</h2>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No blood requests found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Blood Group</th>
                      <th className="text-left py-2">Units</th>
                      <th className="text-left py-2">Urgency</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Hospital</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.request_id} className="border-b">
                        <td className="py-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm">
                            {request.blood_group}
                          </span>
                        </td>
                        <td className="py-2">{request.units_required}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                            request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.urgency}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-2">{request.hospital_name || 'N/A'}</td>
                        <td className="py-2">{new Date(request.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

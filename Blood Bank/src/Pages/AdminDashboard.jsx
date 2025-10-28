import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalPatients: 0,
    totalHospitals: 0,
    pendingHospitals: 0,
    totalRequests: 0,
    totalInventory: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [pendingHospitals, setPendingHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // useEffect(() => {
  //   const token = localStorage.getItem('token')
  //   const userData = localStorage.getItem('user')

  //   if (!token || !userData) {
  //     navigate('/login')
  //     return
  //   }

  //   const parsedUser = JSON.parse(userData)
  //   if (parsedUser.role !== 'admin') {
  //     navigate('/dashboard')
  //     return
  //   }

  //   setUser(parsedUser)
  //   fetchAdminData()
  // }, [navigate])

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

    setUser(parsedUser)
    fetchAdminData()
  }, []) // run only once on mount


  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token')

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch pending hospitals
      const hospitalsResponse = await fetch('http://localhost:5000/api/admin/pending-hospitals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (hospitalsResponse.ok) {
        const hospitalsData = await hospitalsResponse.json()
        setPendingHospitals(hospitalsData)
      }

      // Fetch recent requests
      const requestsResponse = await fetch('http://localhost:5000/api/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRecentRequests(requestsData.slice(0, 5)) // Show only recent 5
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveHospital = async (hospitalId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/hospitals/${hospitalId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setPendingHospitals(prev => prev.filter(h => h.hospital_id !== hospitalId))
        alert('Hospital approved successfully!')
      }
    } catch (error) {
      console.error('Error approving hospital:', error)
      alert('Error approving hospital')
    }
  }

  if (loading) {
    return (
      <div className="container-responsive py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container-responsive py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin-panel')}
            className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600"
          >
            Admin Panel
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-semibold">{stats.totalUsers}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Donors</div>
          <div className="text-2xl font-semibold">{stats.totalDonors}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Patients</div>
          <div className="text-2xl font-semibold">{stats.totalPatients}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Hospitals</div>
          <div className="text-2xl font-semibold">{stats.totalHospitals}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Pending Hospitals</div>
          <div className="text-2xl font-semibold">{stats.pendingHospitals}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-semibold">{stats.totalRequests}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Blood Inventory</div>
          <div className="text-2xl font-semibold">{stats.totalInventory}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Hospitals */}
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Pending Hospital Approvals</h2>
          {pendingHospitals.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No pending hospital approvals
            </div>
          ) : (
            <div className="space-y-3">
              {pendingHospitals.map((hospital) => (
                <div key={hospital.hospital_id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{hospital.hospital_name}</div>
                      <div className="text-sm text-gray-600">{hospital.address}</div>
                      <div className="text-sm text-gray-600">License: {hospital.license_number}</div>
                    </div>
                    <button
                      onClick={() => approveHospital(hospital.hospital_id)}
                      className="rounded-md bg-green-500 text-white px-3 py-1 text-sm hover:bg-green-600"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Blood Requests</h2>
          {recentRequests.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No recent requests
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.request_id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Blood Group: {request.blood_group}</div>
                      <div className="text-sm text-gray-600">
                        Units: {request.units_required} | Urgency: {request.urgency}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

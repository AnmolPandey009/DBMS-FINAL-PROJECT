// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../contexts/AuthContext'

// export default function HospitalDashboard() {
//   const { user, loading: authLoading } = useAuth()
//   const [hospital, setHospital] = useState(null)
//   const [stats, setStats] = useState({
//     totalRequests: 0,
//     pendingRequests: 0,
//     approvedRequests: 0,
//     totalIssues: 0
//   })
//   const [loading, setLoading] = useState(true)
//   const navigate = useNavigate()

//   useEffect(() => {
//     // Wait for auth to finish loading
//     if (authLoading) {
//       return
//     }

//     if (user && user.role?.toLowerCase() === 'hospital') {
//       fetchHospitalData()
//     } else if (user && user.role?.toLowerCase() !== 'hospital') {
//       // If user is logged in but not a hospital, redirect to appropriate dashboard
//       navigate('/dashboard')
//     } else {
//       // If no user data yet, stop loading
//       setLoading(false)
//     }
//   }, [user, authLoading, navigate])



//   const fetchHospitalData = async () => {
//     try {
//       const token = localStorage.getItem('token')

//       if (!token) {
//         setLoading(false)
//         return
//       }

//       // Fetch hospital profile
//       const hospitalResponse = await fetch('http://localhost:5000/api/hospitals/profile', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       })
//       // console.log(hospitalResponse);
//       if (hospitalResponse.ok) {
//         const hospitalData = await hospitalResponse.json()
//         setHospital(hospitalData)
//       }

//       // Fetch dashboard stats
//       const statsResponse = await fetch('http://localhost:5000/api/hospitals/dashboard-stats', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       })

//       // console.log(statsResponse);
//       if (statsResponse.ok) {
//         const statsData = await statsResponse.json()
//         // console.log(statsData);
//         setStats(statsData)
//       }
//     } catch (error) {
//       console.error('Error fetching hospital data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (authLoading || loading) {
//     return (
//       <div className="container-responsive py-12">
//         <div className="text-center">Loading...</div>
//       </div>
//     )
//   }

//   return (
//     <div className="container-responsive py-12">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-semibold">Hospital Dashboard</h1>
//           {hospital && (
//             <p className="text-gray-600">{hospital.hospital_name}</p>
//           )}
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => navigate('/hospital-management')}
//             className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600"
//           >
//             Manage Hospital
//           </button>
//           <button
//             onClick={() => navigate('/blood-inventory')}
//             className="rounded-md bg-green-500 text-white px-4 py-2 text-sm hover:bg-green-600"
//           >
//             View Inventory
//           </button>
//           <button
//             onClick={() => navigate('/add-inventory')}
//             className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700"
//           >
//             Add Inventory
//           </button>
//           <button
//             onClick={() => navigate('/record-donation')}
//             className="rounded-md bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700"
//           >
//             Record Donation
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-600">Total Requests</div>
//           <div className="text-2xl font-semibold">{stats.totalRequests}</div>
//         </div>
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-600">Pending Requests</div>
//           <div className="text-2xl font-semibold">{stats.pendingRequests}</div>
//         </div>
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-600">Approved Requests</div>
//           <div className="text-2xl font-semibold">{stats.approvedRequests}</div>
//         </div>
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-600">Blood Issues</div>
//           <div className="text-2xl font-semibold">{stats.totalIssues}</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="rounded-lg border p-4">
//           <h2 className="text-lg font-semibold mb-4">Hospital Information</h2>
//           {hospital ? (
//             <div className="space-y-2">
//               <div><strong>Name:</strong> {hospital.hospital_name}</div>
//               <div><strong>License:</strong> {hospital.license_number}</div>
//               <div><strong>Address:</strong> {hospital.address}</div>
//               <div><strong>Contact:</strong> {hospital.contact_number}</div>
//               <div><strong>Status:</strong>
//                 <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${hospital.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                   {hospital.is_approved ? 'Approved' : 'Pending Approval'}
//                 </span>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-4 text-gray-500">
//               No hospital information available
//             </div>
//           )}
//         </div>

//         <div className="rounded-lg border p-4">
//           <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
//           <div className="space-y-2">
//             <button
//               onClick={() => navigate('/blood-request')}
//               className="w-full text-left rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
//             >
//               Create Blood Request
//             </button>
//             <button
//               onClick={() => navigate('/blood-inventory')}
//               className="w-full text-left rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
//             >
//               View Blood Inventory
//             </button>
//             <button
//               onClick={() => navigate('/hospital-management')}
//               className="w-full text-left rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
//             >
//               Update Hospital Details
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import BloodIssueForm from '../Components/BloodIssueForm'

export default function HospitalDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [hospital, setHospital] = useState(null)
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalIssues: 0
  })
  const [pendingRequests, setPendingRequests] = useState([])
  const [pendingDonations, setPendingDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBloodIssueForm, setShowBloodIssueForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return

    if (user && user.role?.toLowerCase() === 'hospital') {
      fetchHospitalData()
      fetchPendingRequests()
      fetchPendingDonations()
    } else if (user && user.role?.toLowerCase() !== 'hospital') {
      navigate('/dashboard')
    } else {
      setLoading(false)
    }
  }, [user, authLoading, navigate])

  // const fetchHospitalData = async () => {
  //   try {
  //     const token = localStorage.getItem('token')
  //     if (!token) {
  //       setLoading(false)
  //       return
  //     }

  //     // Fetch hospital profile
  //     const hospitalResponse = await fetch('http://localhost:5000/api/hospitals/profile', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     })

  //     if (hospitalResponse.ok) {
  //       const hospitalData = await hospitalResponse.json()
  //       // Handle both direct object and array responses
  //       if (Array.isArray(hospitalData) && hospitalData.length > 0) {
  //         setHospital(hospitalData[0])
  //       } else if (hospitalData.hospital_id) {
  //         setHospital(hospitalData)
  //       }
  //     }

  //     // Fetch dashboard stats
  //     const statsResponse = await fetch('http://localhost:5000/api/hospitals/dashboard-stats', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     })

  //     if (statsResponse.ok) {
  //       const statsData = await statsResponse.json()
  //       setStats(statsData)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching hospital data:', error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

const fetchHospitalData = async () => {
  try {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    console.log('👤 User data:', userData)
    console.log('📱 User object:', user)
    console.log('🔑 Token exists:', !!token)
    
    if (!token) {
      console.error('No token found')
      setLoading(false)
      return
    }

    // First, let's test if the user has a hospital profile
    console.log('🔍 Checking if user has hospital profile...')

      // Fetch hospital profile
      const hospitalResponse = await fetch('http://localhost:5000/api/hospitals/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Hospital response status:', hospitalResponse.status)

      if (hospitalResponse.ok) {
        const response = await hospitalResponse.json()
        console.log('Hospital response received:', response)

        // Handle the backend response format: { success: true, data: hospitalObject }
        if (response.success && response.data) {
          setHospital(response.data)
          console.log('Hospital data set:', response.data)
        } else {
          console.warn('No hospital data in response:', response)
        }
      } else {
        const errorData = await hospitalResponse.json()
        console.error('Hospital fetch failed:', hospitalResponse.status, errorData)
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5000/api/hospitals/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Stats response status:', statsResponse.status)

      if (statsResponse.ok) {
        const response = await statsResponse.json()
        console.log('Stats response received:', response)

        // Handle the backend response format: { success: true, data: { donations, requests, inventory } }
        if (response.success && response.data) {
          const statsData = response.data
          setStats({
            totalRequests: statsData.requests?.total_requests || 0,
            pendingRequests: statsData.requests?.total_requests - statsData.requests?.approved_requests || 0,
            approvedRequests: statsData.requests?.approved_requests || 0,
            totalIssues: statsData.inventory?.total_units_used || 0
          })
          console.log('Stats data set:', response.data)
        } else {
          console.warn('No stats data in response:', response)
        }
      } else {
        const errorData = await statsResponse.json()
        console.error('Stats fetch failed:', statsResponse.status, errorData)
      }
    } catch (error) {
      console.error('Error fetching hospital data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch pending blood requests
  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/requests/hospital/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      console.log(response);

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setPendingRequests(result.data)
          console.log('Pending requests:', result.data)
        }
      } else {
        console.error('Failed to fetch pending requests:', response.status)
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    }
  }

  // Fetch pending donor donations
  const fetchPendingDonations = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/donations/hospital/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setPendingDonations(result.data)
          console.log('Pending donations:', result.data)
        }
      } else {
        console.error('Failed to fetch pending donations:', response.status)
      }
    } catch (error) {
      console.error('Error fetching pending donations:', error)
    }
  }

  // Handle request approval/rejection
  const handleRequestAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const targetRequest = pendingRequests.find(req => req.id === requestId)

      // If approving, first check availability and then auto-issue to immediately decrement inventory
      if (action === 'approved' && targetRequest) {
        // 1) Check inventory availability
        const availabilityRes = await fetch(`http://localhost:5000/api/inventory/check?bloodGroup=${encodeURIComponent(targetRequest.blood_group)}&units=${encodeURIComponent(targetRequest.units_requested)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!availabilityRes.ok) {
          console.error('Failed to check inventory availability:', availabilityRes.status)
          return
        }

        const availabilityJson = await availabilityRes.json()
        if (!availabilityJson.success || availabilityJson.available !== true) {
          console.error('Insufficient inventory to approve this request')
          return
        }

        // 2) Approve the request
        const approveRes = await fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: action })
        })

        if (!approveRes.ok) {
          console.error('Failed to approve request:', approveRes.status)
          return
        }

        const approveJson = await approveRes.json()
        if (!approveJson.success) {
          console.error('Approve API did not succeed')
          return
        }

        // 3) Immediately create an issue to decrement inventory
        try {
          const issuePayload = {
            request_id: targetRequest.id,
            blood_group: targetRequest.blood_group,
            units_issued: targetRequest.units_requested,
            issued_to: `${targetRequest.patient_first_name || ''} ${targetRequest.patient_last_name || ''}`.trim() || 'Patient',
            issued_by: 'Hospital Staff',
            notes: `Auto-issued on approval from Hospital Dashboard`
          }

          const issueRes = await fetch('http://localhost:5000/api/issues', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(issuePayload)
          })

          if (issueRes.ok) {
            const issueJson = await issueRes.json()
            if (issueJson.success) {
              // Remove from pending list and refresh stats
              setPendingRequests(prev => prev.filter(req => req.id !== requestId))
              fetchHospitalData()
              fetchPendingRequests()
              console.log('Request approved and blood issued successfully')
            } else {
              console.error('Issue creation failed after approval')
            }
          } else {
            console.error('Failed to create issue after approval:', issueRes.status)
          }
        } catch (issueErr) {
          console.error('Error creating issue after approval:', issueErr)
        }

        return
      }

      // Default path (rejection or non-approve actions)
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (action === 'approved') {
            // Old behavior: open issue form manually (kept as fallback path, should rarely hit)
            const request = pendingRequests.find(req => req.id === requestId)
            if (request) {
              setSelectedRequest(request)
              setShowBloodIssueForm(true)
            }
          } else {
            // Remove the request from pending list for rejection
            setPendingRequests(prev => prev.filter(req => req.id !== requestId))
          }
          // Refresh stats
          fetchHospitalData()
          console.log(`Request ${action} successfully`)
        }
      } else {
        console.error(`Failed to ${action} request:`, response.status)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
    }
  }

  // Handle donation approval/rejection
  const handleDonationAction = async (donationId, action) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/donations/${donationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Remove the donation from pending list
          setPendingDonations(prev => prev.filter(donation => donation.id !== donationId))
          // Refresh stats
          fetchHospitalData()
          console.log(`Donation ${action} successfully`)
        }
      } else {
        console.error(`Failed to ${action} donation:`, response.status)
      }
    } catch (error) {
      console.error(`Error ${action}ing donation:`, error)
    }
  }

  // Handle blood issue form close
  const handleBloodIssueClose = () => {
    setShowBloodIssueForm(false)
    setSelectedRequest(null)
    // Remove the request from pending list after blood is issued
    if (selectedRequest) {
      setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id))
    }
  }

  // Handle blood issue success
  const handleBloodIssueSuccess = () => {
    // Refresh data after successful blood issue
    fetchHospitalData()
    fetchPendingRequests()
  }



  if (authLoading || loading) {
    return <div className="container-responsive py-12"><div className="text-center">Loading...</div></div>
  }

  return (
    <div className="container-responsive py-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Hospital Dashboard</h1>
          {hospital && <p className="text-gray-600">{hospital.hospital_name}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/hospital-management')} className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600">Manage Hospital</button>
          <button onClick={() => navigate('/blood-inventory')} className="rounded-md bg-green-500 text-white px-4 py-2 text-sm hover:bg-green-600">View Inventory</button>
          <button onClick={() => navigate('/add-inventory')} className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700">Add Inventory</button>
          <button onClick={() => navigate('/record-donation')} className="rounded-md bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700">Record Donation</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border p-4"><div className="text-sm text-gray-600">Total Requests</div><div className="text-2xl font-semibold">{stats.totalRequests}</div></div>
        <div className="rounded-lg border p-4"><div className="text-sm text-gray-600">Pending Requests</div><div className="text-2xl font-semibold">{stats.pendingRequests}</div></div>
        <div className="rounded-lg border p-4"><div className="text-sm text-gray-600">Approved Requests</div><div className="text-2xl font-semibold">{stats.approvedRequests}</div></div>
        <div className="rounded-lg border p-4"><div className="text-sm text-gray-600">Blood Issues</div><div className="text-2xl font-semibold">{stats.totalIssues}</div></div>
      </div>

      {/* Pending Donor Donations Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pending Donor Donations</h2>
          <button 
            onClick={fetchPendingDonations}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
        
        {pendingDonations.length > 0 ? (
          <div className="space-y-4">
            {pendingDonations.map((donation) => (
              <div key={donation.id} className="rounded-lg border p-4 bg-green-50 border-green-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-medium text-lg">{donation.donor_first_name} {donation.donor_last_name}</span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        DONATION REQUEST
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="ml-2 font-medium">{donation.blood_group}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Units:</span>
                        <span className="ml-2 font-medium">{donation.units_donated}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Donation Date:</span>
                        <span className="ml-2 font-medium">{new Date(donation.donation_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2 font-medium capitalize">{donation.status}</span>
                      </div>
                    </div>
                    {donation.hemoglobin_level && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Hemoglobin:</span>
                        <span className="ml-2 font-medium">{donation.hemoglobin_level}</span>
                      </div>
                    )}
                    {donation.notes && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Notes:</span>
                        <span className="ml-2">{donation.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDonationAction(donation.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDonationAction(donation.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🩸</div>
            <p className="text-lg">No pending donor donations</p>
            <p className="text-sm">All donation requests have been processed</p>
          </div>
        )}
      </div>

      {/* Pending Blood Requests Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pending Blood Requests</h2>
          <button 
            onClick={fetchPendingRequests}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
        
        {pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="rounded-lg border p-4 bg-yellow-50 border-yellow-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-medium text-lg">{request.patient_first_name} {request.patient_last_name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        request.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                        request.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                        request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.urgency?.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="ml-2 font-medium">{request.blood_group}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Units:</span>
                        <span className="ml-2 font-medium">{request.units_requested}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Requested:</span>
                        <span className="ml-2 font-medium">{new Date(request.requested_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reason:</span>
                        <span className="ml-2 font-medium">{request.reason}</span>
                      </div>
                    </div>
                    {request.doctor_name && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Doctor:</span>
                        <span className="ml-2 font-medium">{request.doctor_name}</span>
                        {request.doctor_contact && (
                          <span className="ml-4 text-gray-600">Contact: {request.doctor_contact}</span>
                        )}
                      </div>
                    )}
                    {request.notes && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Notes:</span>
                        <span className="ml-2">{request.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleRequestAction(request.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-lg">No pending blood requests</p>
            <p className="text-sm">All requests have been processed</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Hospital Information</h2>
          {hospital ? (
            <div className="space-y-2">
              <div><strong>Name:</strong> {hospital.hospital_name}</div>
              <div><strong>License:</strong> {hospital.license_number}</div>
              <div><strong>Address:</strong> {hospital.address}</div>
              <div><strong>Contact:</strong> {hospital.contact}</div>
              <div><strong>Status:</strong> <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${hospital.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{hospital.is_approved ? 'Approved' : 'Pending Approval'}</span></div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No hospital information available</div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button onClick={() => navigate('/blood-request')} className="w-full text-left rounded-md border px-3 py-2 text-sm hover:bg-gray-50">Create Blood Request</button>
            <button onClick={() => navigate('/blood-inventory')} className="w-full text-left rounded-md border px-3 py-2 text-sm hover:bg-gray-50">View Blood Inventory</button>
            <button onClick={() => navigate('/hospital-management')} className="w-full text-left rounded-md border px-3 py-2 text-sm hover:bg-gray-50">Update Hospital Details</button>
          </div>
        </div>
      </div>

      {/* Blood Issue Form Modal */}
      {showBloodIssueForm && selectedRequest && (
        <BloodIssueForm
          request={selectedRequest}
          onClose={handleBloodIssueClose}
          onSuccess={handleBloodIssueSuccess}
        />
      )}
    </div>
  )
}

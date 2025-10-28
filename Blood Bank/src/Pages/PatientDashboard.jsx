// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'

// export default function PatientDashboard() {
//   const [user, setUser] = useState(null)
//   const [requests, setRequests] = useState([])
//   const [loading, setLoading] = useState(true)
//   const navigate = useNavigate()

//   useEffect(() => {
//     const token = localStorage.getItem('token')
//     const userData = localStorage.getItem('user')
    
//     if (!token || !userData) {
//       navigate('/login')
//       return
//     }

//     setUser(JSON.parse(userData))
//     fetchPatientRequests()
//   }, [navigate])

//   const fetchPatientRequests = async () => {
//     try {
//       const token = localStorage.getItem('token')
//       const response = await fetch('http://localhost:5000/api/requests/patient/profile', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       })

//       console.log(response);

//       if (response.ok) {
//         const data = await response.json()
//         // Ensure data is always an array
//         setRequests(Array.isArray(data) ? data : [])
//       } else {
//         // If request fails, set empty array
//         setRequests([])
//       }
//     } catch (error) {
//       console.error('Error fetching requests:', error)
//       // Set empty array on error to prevent filter errors
//       setRequests([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const createNewRequest = () => {
//     navigate('/blood-request')
//   }

//   if (loading) {
//     return (
//       <div className="container-responsive py-12">
//         <div className="text-center">Loading...</div>
//       </div>
//     )
//   }

//   return (
//     <div className="container-responsive py-12">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-semibold">Patient Dashboard</h1>
//         <button 
//           onClick={createNewRequest}
//           className="rounded-md bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
//         >
//           New Blood Request
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-600">Total Requests</div>
//           <div className="text-2xl font-semibold">{Array.isArray(requests) ? requests.length : 0}</div>
//         </div>
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-600">Pending Requests</div>
//           <div className="text-2xl font-semibold">
//             {Array.isArray(requests) ? requests.filter(r => r.status === 'pending').length : 0}
//           </div>
//         </div>
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-600">Approved Requests</div>
//           <div className="text-2xl font-semibold">
//             {Array.isArray(requests) ? requests.filter(r => r.status === 'approved').length : 0}
//           </div>
//         </div>
//       </div>

//       <div className="rounded-lg border p-4">
//         <h2 className="text-lg font-semibold mb-4">My Blood Requests</h2>
//         {!Array.isArray(requests) || requests.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             No blood requests yet. Create your first request!
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {requests.map((request) => (
//               <div key={request.request_id} className="border rounded-lg p-4">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <div className="font-medium">Blood Group: {request.blood_group}</div>
//                     <div className="text-sm text-gray-600">
//                       Units Required: {request.units_required}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       Urgency: {request.urgency}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       Request Date: {new Date(request.created_at).toLocaleDateString()}
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <span className={`px-2 py-1 rounded text-xs font-medium ${
//                       request.status === 'approved' ? 'bg-green-100 text-green-800' :
//                       request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-red-100 text-red-800'
//                     }`}>
//                       {request.status}
//                     </span>
//                   </div>
//                 </div>
//                 {request.notes && (
//                   <div className="mt-2 text-sm text-gray-600">
//                     <strong>Notes:</strong> {request.notes}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PatientDashboard() {
  const [user, setUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchPatientRequests()
  }, []) // Remove navigate from dependencies

  const fetchPatientRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/requests/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data) // Debug log
        
        // Handle both array and object responses
        if(data?.data?.overall){
          setRequests(data);
        }
        
        // if (Array.isArray(data)) {
        //   setRequests(data)
        // } else if (data.requests && Array.isArray(data.requests)) {
        //   setRequests(data.requests) // Extract array from object
        // } 
        else {
          console.warn('Unexpected data format:', data)
          setRequests([])
        }
      } else {
        console.error('Request failed with status:', response.status)
        setRequests([])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const createNewRequest = () => {
    navigate('/blood-request')
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
        <h1 className="text-2xl font-semibold">Patient Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/profile/edit')}
            className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600"
          >
            Edit Profile
          </button>
          <button 
            onClick={createNewRequest}
            className="rounded-md bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
          >
            New Blood Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-semibold">{requests?.data?.overall?.total_requests}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Pending Requests</div>
          <div className="text-2xl font-semibold">
            {requests?.data?.overall?.pending_requests}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Approved Requests</div>
          <div className="text-2xl font-semibold">
            {requests?.data?.overall?.approved_requests}
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">My Blood Requests</h2>
        {requests?.data?.byBloodGroup?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No blood requests yet. Create your first request!
          </div>
        ) : (
          <div className="space-y-4">
            {requests?.data?.requiredStats?.map((request) => (
              <div key={request.request_id} className="border rounded-lg p-4">
              
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Blood Group: {request.blood_group}</div>
                    <div className="text-sm text-gray-600">
                      Units Required: {request.units_requested}
                    </div>
                    <div className="text-sm text-gray-600">
                      Urgency: {request.urgency}
                    </div>
                    <div className="text-sm text-gray-600">
                      Request Date: {new Date(request.requested_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
                {/* <h1>Hello</h1> */}
                {request.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Notes:</strong> {request.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


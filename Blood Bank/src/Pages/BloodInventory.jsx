import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BloodInventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/inventory');

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data); // Debug

        // Backend returns { inventory: [...] }
        setInventory(data?.data || []);
      } else {
        setError('Failed to fetch inventory data');
        setInventory([]);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch error:', err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };


  const filteredInventory = filterGroup
    ? inventory.filter(item => item.blood_group === filterGroup)
    : inventory

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  // Calculate total units by blood group
  const inventoryByGroup = bloodGroups.map(group => {
    const groupItems = inventory.filter(item => item.blood_group === group)
    const totalUnits = groupItems.reduce((sum, item) => sum + item.units_available, 0)
    return { group, totalUnits, items: groupItems }
  })

  if (loading) {
    return (
      <div className="container-responsive py-12">
        <div className="text-center">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="container-responsive py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Blood Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchInventory}
            className="rounded-md bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate(-1)}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All Blood Groups</option>
          {bloodGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {inventoryByGroup.map(({ group, totalUnits }) => (
          <div key={group} className="rounded-lg border p-4 text-center">
            <div className="text-sm text-gray-600">{group}</div>
            <div className="text-2xl font-semibold">{totalUnits}</div>
            <div className="text-xs text-gray-500">units</div>
          </div>
        ))}
      </div>

      {/* Detailed Inventory */}
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">
          {filterGroup ? `${filterGroup} Blood Group Details` : 'All Blood Inventory Details'}
        </h2>

        {filteredInventory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filterGroup ? `No ${filterGroup} blood available` : 'No blood inventory available'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Blood Group</th>
                  <th className="text-left py-2">Component Type</th>
                  <th className="text-left py-2">Units Available</th>
                  <th className="text-left py-2">Expiry Date</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-semibold">
                        {item.blood_group}
                      </span>
                    </td>
                    <td className="py-2">{item.component_type || 'Whole Blood'}</td>
                    <td className="py-2 font-medium">{item.units_available}</td>
                    <td className="py-2">
                      {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'available' ? 'bg-green-100 text-green-800' :
                          item.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2">{item.location || 'Main Storage'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Need Blood?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Create a blood request if you need specific blood units
          </p>
          <button
            onClick={() => navigate('/blood-request')}
            className="rounded-md bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
          >
            Create Request
          </button>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Want to Donate?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Register as a donor to help save lives
          </p>
          <button
            onClick={() => navigate('/donor-registration')}
            className="rounded-md bg-green-500 text-white px-4 py-2 text-sm hover:bg-green-600"
          >
            Register as Donor
          </button>
        </div>
      </div>
    </div>
  )
}

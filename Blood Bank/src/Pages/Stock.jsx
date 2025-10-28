export default function Stock() {
  const stock = [
    { type: 'A+', units: 24 },
    { type: 'A-', units: 8 },
    { type: 'B+', units: 18 },
    { type: 'B-', units: 6 },
    { type: 'AB+', units: 5 },
    { type: 'AB-', units: 2 },
    { type: 'O+', units: 30 },
    { type: 'O-', units: 4 },
  ]
  return (
    <div className="container-responsive py-12">
      <h1 className="text-2xl font-semibold mb-6">Blood Stock</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {stock.map((s) => (
          <div key={s.type} className="rounded-lg border p-4 text-center">
            <div className="text-sm text-gray-600">{s.type}</div>
            <div className="mt-1 text-xl font-semibold text-red-600">{s.units}</div>
            <div className="text-xs text-gray-500">units</div>
          </div>
        ))}
      </div>
    </div>
  )
}

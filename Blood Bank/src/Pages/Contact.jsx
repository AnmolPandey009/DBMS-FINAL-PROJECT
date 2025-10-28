export default function Contact() {
  return (
    <div className="container-responsive py-12">
      <h1 className="text-2xl font-semibold mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form className="space-y-4">
          <input placeholder="Name" className="w-full rounded-md border px-3 py-2 text-sm" />
          <input placeholder="Email" className="w-full rounded-md border px-3 py-2 text-sm" />
          <textarea placeholder="Message" rows={5} className="w-full rounded-md border px-3 py-2 text-sm" />
          <button className="rounded-md bg-red-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-red-600">Send</button>
        </form>
        <div>
          <div className="rounded-lg overflow-hidden border">
            <iframe title="map" src="https://www.openstreetmap.org/export/embed.html?bbox=72.8%2C18.9%2C72.95%2C19.05&amp;layer=mapnik" className="w-full h-64"></iframe>
          </div>
          <div className="mt-4 text-sm text-gray-700">Follow us on social media.</div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import Cards from './cards'
import BloodDonationInfo from './BloodDonationInfo'

export default function Home() {
  return (
    <div className=''>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2400&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="bg-white/70 backdrop-blur-sm">
          <div className="container-responsive py-24 px-20">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-3xl">Donate blood, save lives. Your one donation can be someone's lifeline.</h1>
            <p className="mt-4 text-gray-700 max-w-2xl">Join our community of donors and help ensure a stable supply of blood for those in urgent need.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/donor-registration" className="rounded-md bg-red-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-red-600">Register as Donor</Link>
              <Link to="/blood-requests" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium hover:border-gray-400">Request Blood</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-responsive py-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-20">
        <div className="rounded-lg border p-6">
          <div className="text-3xl font-bold text-red-600">2,345</div>
          <div className="text-sm text-gray-600">Registered Donors</div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="text-3xl font-bold text-red-600">8</div>
          <div className="text-sm text-gray-600">Blood Types Available</div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="text-3xl font-bold text-red-600">128</div>
          <div className="text-sm text-gray-600">Active Requests</div>
        </div>
      </section>

      <section className="container-responsive pb-16 px-20">
        <h2 className="text-xl font-semibold mb-4">Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-lg border p-6 bg-white">
              <p className="text-sm text-gray-700">"Excellent initiative. The process was smooth and I feel proud to help."</p>
              <div className="mt-3 text-sm font-medium">Donor {i}</div>
            </div>
          ))}
        </div>
      </section>

      <BloodDonationInfo />
      <Cards />

    </div>
  )
}

import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <>
  
    <footer className="border-t bg-white px-4">
      <div className="container-responsive py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-500 text-white font-bold">+
            </span>
            <span className="font-semibold text-lg">BloodBank</span>
          </div>
          <p className="text-sm text-gray-600">Saving lives through efficient blood donation and distribution.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/donor-registration">Donate</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>123 Lifeline Ave, City</li>
            <li>+91 98765 43210</li>
            <li>support@bloodbank.org</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Newsletter</h4>
          <form className="flex gap-2">
            <input type="email" placeholder="Your email" className="flex-1 rounded-md border px-3 py-2 text-sm" />
            <button type="submit" className="rounded-md bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600">Subscribe</button>
          </form>
          <div className="mt-3 text-sm text-gray-600">We care about your privacy.</div>
        </div>
      </div>
    </footer>
      <div className="border-t py-4 text-center text-sm text-gray-600">© {new Date().getFullYear()} BloodBank. All rights reserved.</div>
      </>
  )
}

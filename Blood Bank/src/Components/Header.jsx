import { Fragment, useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/donor-registration', label: 'Donor Reg' },
  { to: '/blood-requests', label: 'Blood Request' },
  { to: '/stock', label: 'Stock' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (

    // <div className="px-10">
    <header className={`px-10 sticky top-0 z-50 transition-shadow ${scrolled ? 'bg-white/95 shadow-md backdrop-blur' : 'bg-transparent'}`}>
      <div className="container-responsive flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-500 text-white font-bold">+
          </span>
          <span className="font-semibold text-lg">BloodBank</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `text-sm transition-colors ${isActive ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/donor-registration" className="inline-flex items-center rounded-md bg-red-500 text-white px-4 py-2 text-sm font-medium hover:bg-red-600 transition-colors">
            Donate Blood
          </Link>
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-red-600">
              <UserCircleIcon className="h-6 w-6" /> Login
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
              <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link to="/login" className={`block px-3 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}>Login</Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link to="/dashboard" className={`block px-3 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}>Dashboard</Link>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </nav>

        <button className="md:hidden inline-flex items-center justify-center w-10 h-10" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container-responsive py-3 flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `py-2 ${isActive ? 'text-red-600' : 'text-gray-700'}`} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <Link to="/donor-registration" className="inline-flex items-center justify-center rounded-md bg-red-500 text-white px-4 py-2 text-sm font-medium hover:bg-red-600" onClick={() => setOpen(false)}>
              Donate Blood
            </Link>
            <div className="flex gap-4 pt-2">
              <Link to="/login" className="text-sm text-gray-700" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/dashboard" className="text-sm text-gray-700" onClick={() => setOpen(false)}>Dashboard</Link>
            </div>
          </div>
        </div>
      )}
    </header>
    // </div>
  )
}



// export default function Header(){

//     return(
//         <>
//             <div className="flex justify-between bg-red-400 py-4">
//                 <div className="px-4">IMG</div>
//                 <div className="flex">
//                     <button className="px-4">HOME</button>
//                     <button className="px-4">LOOKING FOR BLOOD</button>
//                     <button className="px-4">WAIT TO DONATE BLOOD</button>
//                     <button className="px-4">BLOOD CENTER LOGIN</button>
//                 </div>
//             </div>
//         </>
//     )
// }
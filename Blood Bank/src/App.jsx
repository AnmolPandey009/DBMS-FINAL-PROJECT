import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import Footer from './Components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRedirect from './components/AuthRedirect'
import AppInitializer from './components/AppInitializer'

// Pages
import Home from './Components/Home.jsx'
import About from './Pages/About.jsx'
import Contact from './Pages/Contact.jsx'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import DonorDashboard from './Pages/DonorDashboard.jsx'
import PatientDashboard from './Pages/PatientDashboard.jsx'
import HospitalDashboard from './Pages/HospitalDashboard.jsx'
import DonorRegistration from './Pages/DonorRegistation.jsx'
import PatientRegistration from './Pages/PatientRegistration.jsx'
import BloodRequest from './Pages/BloodRequest.jsx'
import BloodRequests from './Pages/BloodRequests.jsx'
import BloodInventory from './Pages/BloodInventory.jsx'
import HospitalManagement from './Pages/HospitalManagement.jsx'
import AddInventory from './Pages/AddInventory.jsx'
import RecordDonation from './Pages/RecordDonation.jsx'
import DonorBloodDonation from './Pages/DonorBloodDonation.jsx'
import ProfileEditForm from './Pages/ProfileEditForm.jsx'

function App() {
  return (
    <AuthProvider>
      <AppInitializer>
        <div className='min-h-screen flex flex-col'>
          <NavBar />
          <main className='flex-1'>
            <Routes>
            {/* Auth Redirect Route */}
            <Route path="/auth-redirect" element={<AuthRedirect />} />
            
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/blood-inventory" element={<BloodInventory />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/donor-dashboard" element={
              <ProtectedRoute requiredRole="donor">
                <DonorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/patient-dashboard" element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/hospital-dashboard" element={
              <ProtectedRoute requiredRole="hospital">
                <HospitalDashboard />
              </ProtectedRoute>
            } />
            
            
            <Route path="/donor-registration" element={
              <ProtectedRoute>
                <DonorRegistration />
              </ProtectedRoute>
            } />
            
            <Route path="/patient-registration" element={
              <ProtectedRoute>
                <PatientRegistration />
              </ProtectedRoute>
            } />
            
            <Route path="/blood-request" element={
              <ProtectedRoute requiredRoles={['patient', 'hospital']}>
                <BloodRequest />
              </ProtectedRoute>
            } />
            
            <Route path="/blood-requests" element={
              <ProtectedRoute>
                <BloodRequests />
              </ProtectedRoute>
            } />
            
            <Route path="/hospital-management" element={
              <ProtectedRoute requiredRole="hospital">
                <HospitalManagement />
              </ProtectedRoute>
            } />

            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <ProfileEditForm />
              </ProtectedRoute>
            } />

            <Route path="/add-inventory" element={
              <ProtectedRoute requiredRole="hospital">
                <AddInventory />
              </ProtectedRoute>
            } />

            <Route path="/record-donation" element={
              <ProtectedRoute requiredRole="hospital">
                <RecordDonation />
              </ProtectedRoute>
            } />
            
            <Route path="/donor-blood-donation" element={
              <ProtectedRoute requiredRole="donor">
                <DonorBloodDonation />
              </ProtectedRoute>
            } />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/stock" element={<BloodInventory />} />
          </Routes>
          </main>
          <Footer />
        </div>
      </AppInitializer>
    </AuthProvider>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SearchBikes from './pages/SearchBikes'
import MyBikes from './pages/MyBikes'
import AddBike from './pages/AddBike'
import AddSlot from './pages/AddSlot'
import KycSubmit from './pages/KycSubmit'
import AdminKyc from './pages/AdminKyc'
import MyBookings from './pages/MyBookings'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Any authenticated user */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/kyc" element={
            <ProtectedRoute>
              <KycSubmit />
            </ProtectedRoute>
          } />

          {/* TAKER Routes */}
          <Route path="/search" element={
            <ProtectedRoute allowedRoles={['TAKER', 'ADMIN']}>
              <SearchBikes />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute allowedRoles={['TAKER']}>
              <MyBookings />
            </ProtectedRoute>
          } />

          {/* BIKER Routes */}
          <Route path="/my-bikes" element={
            <ProtectedRoute allowedRoles={['BIKER']}>
              <MyBikes />
            </ProtectedRoute>
          } />
          <Route path="/add-bike" element={
            <ProtectedRoute allowedRoles={['BIKER']}>
              <AddBike />
            </ProtectedRoute>
          } />
          <Route path="/add-slot/:bikeId" element={
            <ProtectedRoute allowedRoles={['BIKER']}>
              <AddSlot />
            </ProtectedRoute>
          } />

          {/* ADMIN Routes */}
          <Route path="/admin/kyc" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminKyc />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

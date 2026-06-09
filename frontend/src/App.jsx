import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy loaded page components
const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/Login'))
const Register = React.lazy(() => import('./pages/Register'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const SearchBikes = React.lazy(() => import('./pages/SearchBikes'))
const MyBikes = React.lazy(() => import('./pages/MyBikes'))
const AddBike = React.lazy(() => import('./pages/AddBike'))
const AddSlot = React.lazy(() => import('./pages/AddSlot'))
const KycSubmit = React.lazy(() => import('./pages/KycSubmit'))
const AdminKyc = React.lazy(() => import('./pages/AdminKyc'))
const MyBookings = React.lazy(() => import('./pages/MyBookings'))

// Premium Techy Loading Spinner
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-950">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-indigo-500 rounded-full animate-ping opacity-30"></div>
    </div>
    <span className="mt-4 text-cyan-400 font-mono text-xs tracking-widest uppercase animate-pulse">
      Syncing Grid Interface...
    </span>
  </div>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}


export default App

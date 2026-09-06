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

// Premium Startup-Style Loading Spinner
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-200">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-amber-500 rounded-full animate-ping opacity-30"></div>
    </div>
    <span className="mt-4 text-rose-500 dark:text-rose-400 font-mono text-xs tracking-widest uppercase animate-pulse">
      Loading motoShare...
    </span>
  </div>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-neutral-800 dark:text-slate-100 font-sans selection:bg-rose-500 selection:text-white transition-colors duration-200">
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

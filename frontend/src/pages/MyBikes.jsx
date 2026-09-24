import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bikerAPI } from '../services/api';

function MyBikes() {
  const { user } = useAuth();
  const location = useLocation();
  const [bikes, setBikes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  useEffect(() => {
    fetchData();
  }, [user]);

  // Auto-dismiss the AddBike success toast so it doesn't stick around
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const fetchData = async () => {
    try {
      setError('');
      const [bikesData, bookingsData] = await Promise.all([
        bikerAPI.getMyBikes(),
        bikerAPI.getMyBookings()
      ]);
      setBikes(bikesData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching biker data:', err);
      setError(err.response?.data?.message || 'Failed to load your bikes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const activeBookings = bookings.filter((b) => b.status === 'UPCOMING').length;
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white dark:bg-slate-950 min-h-[85vh] text-neutral-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Success toast from AddBike (via navigate state) */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* API error — never silently show an empty state on failure */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">My Bikes</h1>
          <p className="text-neutral-550 dark:text-slate-400 mt-2 font-medium">Manage your listed bikes and track earnings</p>
        </div>
        <Link
          to="/add-bike"
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-6 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all duration-200 active:scale-95 shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add New Bike
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm p-6 rounded-2xl">
          <div className="text-2xl font-black text-emerald-500">₹{totalEarnings.toLocaleString()}</div>
          <div className="text-neutral-450 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1.5">Total Earnings</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm p-6 rounded-2xl">
          <div className="text-2xl font-black text-rose-500 dark:text-rose-400">{activeBookings}</div>
          <div className="text-neutral-455 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1.5">Upcoming Bookings</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm p-6 rounded-2xl">
          <div className="text-2xl font-black text-neutral-900 dark:text-white">{completedBookings}</div>
          <div className="text-neutral-450 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1.5">Completed Bookings</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 mb-8">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-450 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-850 dark:text-blue-300 font-bold text-sm">Getting Started as a Bike Owner</p>
            <p className="text-blue-700 dark:text-blue-400 text-sm mt-1.5 leading-relaxed font-semibold">
              1. Add your bike details using the "Add New Bike" button<br />
              2. Create availability slots for when the bike can be rented<br />
              3. Riders will find and book your bike based on your slots
            </p>
          </div>
        </div>
      </div>

      {/* Bikes List */}
      {bikes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {bikes.map((bike) => (
            <div key={bike.bikeId} className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-slate-800 dark:to-slate-850 flex items-center justify-center">
                <svg className="w-16 h-16 text-neutral-400 dark:text-slate-650" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 17.5 9 10h4l3 7.5M9 10 7 6h2.5M13 10V7h3" />
                </svg>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {bike.company} {bike.model}
                </h3>
                <p className="text-neutral-500 dark:text-slate-450 text-xs font-semibold mt-1">
                  {bike.bikeNumber} | {bike.kms} kms
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-rose-500 dark:text-rose-455 font-bold text-base">₹{bike.ratePerHour}/hr</span>
                  <Link
                    to={`/add-slot/${bike.bikeId}`}
                    className="text-sm text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-350 font-bold uppercase tracking-wider"
                  >
                    Add Slot
                  </Link>
                </div>

                {/* Active Slots list */}
                {bike.slots && bike.slots.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-neutral-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Listed Slots
                    </h4>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {bike.slots.map((slot) => (
                        <div
                          key={slot.slotId}
                          className="flex items-center justify-between text-xs bg-neutral-50 dark:bg-slate-850/50 p-2.5 rounded-xl border border-neutral-100 dark:border-slate-800"
                        >
                          <div className="text-neutral-600 dark:text-slate-300 font-semibold">
                            <div>{formatDateTime(slot.startTime)}</div>
                            <div className="text-[10px] text-neutral-400 dark:text-slate-500">to {formatDateTime(slot.endTime)}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                              slot.isAvailable
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-neutral-100 dark:bg-slate-800 border-neutral-200 dark:border-slate-700 text-neutral-500 dark:text-slate-400'
                            }`}
                          >
                            {slot.isAvailable ? 'Available' : 'Booked'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl mb-8">
          <svg className="w-16 h-16 text-neutral-350 dark:text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <circle cx="5.5" cy="17.5" r="3.5" />
            <circle cx="18.5" cy="17.5" r="3.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 17.5 9 10h4l3 7.5M9 10 7 6h2.5M13 10V7h3" />
          </svg>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No Bikes Listed Yet</h3>
          <p className="text-neutral-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm">
            You haven't added any bikes yet. Start earning by listing your first bike!
          </p>
          <Link
            to="/add-bike"
            className="inline-flex items-center px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Bike
          </Link>
        </div>
      )}

      {/* Recent Bookings Section */}
      {bookings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Recent Bookings on Your Bikes</h2>
          <div className="space-y-3">
            {bookings.slice(0, 10).map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">
                      {booking.bikeCompany} {booking.bikeModel}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'UPCOMING'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-neutral-100 dark:bg-slate-800 border-neutral-200 dark:border-slate-700 text-neutral-500 dark:text-slate-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">
                    {booking.pickupLocation}, {booking.city} | {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 sm:ml-4">
                  <span className="text-lg font-black text-emerald-500">₹{booking.totalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBikes;

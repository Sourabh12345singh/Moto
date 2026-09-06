import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await userAPI.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white dark:bg-slate-950 text-neutral-800 dark:text-slate-100 min-h-[85vh] transition-colors duration-200 font-sans">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">My Bookings</h1>
        <p className="text-neutral-500 dark:text-slate-400 mt-2 font-medium">View your upcoming and past bike bookings</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 rounded-xl p-4 mb-6">
          <p className="text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md dark:hover:shadow-slate-950/40 transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Bike info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {booking.bikeCompany} {booking.bikeModel}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          booking.status === 'UPCOMING'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-neutral-100 dark:bg-slate-800 border-neutral-200 dark:border-slate-700 text-neutral-550 dark:text-slate-400'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-neutral-500 dark:text-slate-400 text-sm mb-3 font-semibold">
                      <svg className="w-4 h-4 mr-1.5 text-neutral-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{booking.pickupLocation}, {booking.city}</span>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-neutral-400 dark:text-slate-500">Start: </span>
                        <span className="text-neutral-800 dark:text-slate-200 font-semibold">{formatDateTime(booking.startTime)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 dark:text-slate-500">End: </span>
                        <span className="text-neutral-800 dark:text-slate-200 font-semibold">{formatDateTime(booking.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="mt-4 sm:mt-0 sm:ml-6 sm:text-right">
                    <div className="text-2xl font-black text-rose-500 dark:text-rose-455">
                      ₹{booking.totalPrice}
                    </div>
                    <div className="text-neutral-450 dark:text-slate-500 text-xs font-semibold mt-1">
                      {booking.durationHours}h &times; ₹{booking.pricePerHour}/hr
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <svg className="w-16 h-16 text-neutral-350 dark:text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No Bookings Yet</h3>
          <p className="text-neutral-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm">
            You haven't booked any bikes yet. Find a bike in your city and book your first ride!
          </p>
          <Link
            to="/search"
            className="inline-flex items-center px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm text-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find Bikes
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyBookings;

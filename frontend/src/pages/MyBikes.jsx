import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bikerAPI } from '../services/api';

function MyBikes() {
  const { user } = useAuth();
  const [bikes, setBikes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch biker's bookings
      const bookingsData = await bikerAPI.getMyBookings();
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching biker data:', err);
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bikes</h1>
          <p className="text-gray-600 mt-2">Manage your listed bikes and track earnings</p>
        </div>
        <Link
          to="/add-bike"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Bike
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">Rs {totalEarnings.toLocaleString()}</div>
          <div className="text-gray-500 text-sm">Total Earnings</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{activeBookings}</div>
          <div className="text-gray-500 text-sm">Upcoming Bookings</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-gray-900">{completedBookings}</div>
          <div className="text-gray-500 text-sm">Completed Bookings</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-800 font-medium">Getting Started as a Bike Owner</p>
            <p className="text-blue-700 text-sm mt-1">
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
            <div key={bike.bikeId} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  {bike.company} {bike.model}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {bike.bikeNumber} | {bike.kms} kms
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-primary-600 font-semibold">Rs {bike.ratePerHour}/hr</span>
                  <Link
                    to={`/add-slot/${bike.bikeId}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Add Slot
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-md mb-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bikes Listed Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't added any bikes yet. Start earning by listing your first bike!
          </p>
          <Link
            to="/add-bike"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Bike
          </Link>
        </div>
      )}

      {/* Recent Bookings Section */}
      {bookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings on Your Bikes</h2>
          <div className="space-y-3">
            {bookings.slice(0, 10).map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {booking.bikeCompany} {booking.bikeModel}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'UPCOMING'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {booking.pickupLocation}, {booking.city} | {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 sm:ml-4">
                  <span className="text-lg font-bold text-green-600">Rs {booking.totalPrice}</span>
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

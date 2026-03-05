import { useState } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BikeCard from '../components/BikeCard';
import BookingModal from '../components/BookingModal';

const CITIES = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Jaipur',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
];

function SearchBikes() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [selectedCity, setSelectedCity] = useState('');
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [kycWarning, setKycWarning] = useState(false);

  const kycApproved = user?.kycStatus === 'APPROVED';

  const handleSearch = async () => {
    if (!selectedCity) {
      setError('Please select a city');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);
    setBookingSuccess(false);

    try {
      const data = await userAPI.searchBikes(selectedCity);
      setBikes(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bikes. Please try again.');
      setBikes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bike) => {
    if (!kycApproved) {
      setKycWarning(true);
      return;
    }
    setKycWarning(false);
    setSelectedBike(bike);
  };

  const handleBookingSuccess = () => {
    setSelectedBike(null);
    setBookingSuccess(true);
    // Refresh the bike list
    handleSearch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Available Bikes</h1>
        <p className="text-gray-600 mt-2">Search for bikes in your city and book instantly</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Select City
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            >
              <option value="">Choose a city...</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search Bikes'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* KYC Warning */}
      {kycWarning && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>KYC verification required before booking. Please complete your KYC to book bikes.</span>
          </div>
          <a
            href="/kyc"
            className="ml-4 px-4 py-1.5 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap"
          >
            Complete KYC
          </a>
        </div>
      )}

      {/* Success Message */}
      {bookingSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Booking confirmed successfully! The bike owner will be notified.
        </div>
      )}

      {/* Results Section */}
      {searched && !loading && (
        <>
          {bikes.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  Found <span className="font-semibold text-gray-900">{bikes.length}</span> available bike(s) in{' '}
                  <span className="font-semibold text-gray-900">{selectedCity}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bikes.map((bike) => (
                  <BikeCard key={bike.slotId} bike={bike} onBook={handleBookClick} hideBookButton={isAdmin} kycApproved={kycApproved} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bikes Available</h3>
              <p className="text-gray-500">
                No bikes are currently available in {selectedCity}. Please try another city or check back later.
              </p>
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Bikes</h3>
          <p className="text-gray-500">
            Select a city above to find available bikes for rent.
          </p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedBike && (
        <BookingModal
          bike={selectedBike}
          onClose={() => setSelectedBike(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

export default SearchBikes;

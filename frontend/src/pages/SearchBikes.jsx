import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    handleSearch();
  };

  // Auto-dismiss the booking success banner so it doesn't stick around forever
  useEffect(() => {
    if (!bookingSuccess) return;
    const timer = setTimeout(() => setBookingSuccess(false), 6000);
    return () => clearTimeout(timer);
  }, [bookingSuccess]);

  // Refresh the list when the modal closes (e.g. after a double-booking
  // error) so a just-taken slot doesn't still look available.
  const handleModalClose = () => {
    setSelectedBike(null);
    if (searched && selectedCity) {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white dark:bg-slate-950 min-h-[85vh] text-neutral-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Page Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Find Your Ride
        </h1>
        <p className="text-neutral-500 dark:text-slate-400 mt-2 font-medium">
          Choose from verified local vehicles and start your rental block instantly
        </p>
      </div>

      {/* Search Bar / Select Sector */}
      <div className="bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 p-6 rounded-2xl mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <label htmlFor="city" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select City
            </label>
            <div className="relative">
              <select
                id="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 hover:border-neutral-300 dark:hover:border-slate-600 focus:border-rose-500 rounded-xl text-neutral-800 dark:text-slate-100 outline-none transition-all duration-200 text-sm font-semibold cursor-pointer appearance-none"
              >
                <option value="" className="text-neutral-400 dark:text-slate-500">Where are you heading?</option>
                {CITIES.map((city) => (
                  <option key={city} value={city} className="bg-white dark:bg-slate-900 text-neutral-800 dark:text-slate-200">
                    {city}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-550 dark:text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center"
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
          <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {error}
          </div>
        )}
      </div>

      {/* KYC Warning */}
      {kycWarning && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-semibold">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-500 dark:text-amber-450 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>KYC Clearance Required: Please complete identity verification before booking local rentals.</span>
          </div>
          <Link
            to="/kyc"
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold text-center hover:bg-amber-600 transition-colors uppercase tracking-wider shadow-sm"
          >
            Verify KYC
          </Link>
        </div>
      )}

      {/* Success Message */}
      {bookingSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <svg className="w-5 h-5 text-emerald-500 dark:text-emerald-450 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Booking Successful! Your reservation request has been processed. The host has been notified.
        </div>
      )}

      {/* Results Section */}
      {searched && !loading && (
        <>
          {bikes.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6 border-b border-neutral-100 dark:border-slate-800 pb-3">
                <p className="text-sm text-neutral-500 dark:text-slate-400 font-medium">
                  Showing <span className="text-neutral-900 dark:text-white font-bold">{bikes.length}</span> bike(s) in <span className="text-rose-500 font-bold">{selectedCity}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bikes.map((bike) => (
                  <BikeCard key={bike.slotId} bike={bike} onBook={handleBookClick} hideBookButton={isAdmin} kycApproved={kycApproved} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl">
              <svg className="w-12 h-12 text-neutral-300 dark:text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">No Bikes Available</h3>
              <p className="text-neutral-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                No active rental slots were found in {selectedCity} right now. Please try a different location or check back later.
              </p>
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="text-center py-20 bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl">
          <svg className="w-12 h-12 text-neutral-300 dark:text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Select a Location</h3>
          <p className="text-neutral-500 dark:text-slate-400 text-sm">
            Choose a city above to view available peer-to-peer bike rentals.
          </p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedBike && (
        <BookingModal
          bike={selectedBike}
          onClose={handleModalClose}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

export default SearchBikes;

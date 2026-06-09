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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-950 min-h-[85vh] text-slate-100 font-sans relative">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-wider font-mono uppercase">
          Acquisition <span className="text-cyan-400">Terminal</span>
        </h1>
        <p className="text-slate-500 mt-2 font-mono text-xs tracking-widest uppercase">
          Search active vehicles in selected grid sector
        </p>
      </div>

      {/* Search Section (Glassmorphism card) */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <label htmlFor="city" className="block text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
              Select Sector Grid (City)
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl text-white outline-none transition-all duration-300 font-mono text-sm focus:shadow-[0_0_15px_rgba(6,180,212,0.15)] appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-950 text-slate-500">Choose sector...</option>
              {CITIES.map((city) => (
                <option key={city} value={city} className="bg-slate-950 text-white">
                  {city.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-sm tracking-wider uppercase rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(6,180,212,0.25)] hover:shadow-[0_0_20px_rgba(6,180,212,0.45)] transform active:scale-95 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </span>
              ) : (
                'Scan Sector'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            {error}
          </div>
        )}
      </div>

      {/* KYC Warning */}
      {kycWarning && (
        <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs leading-relaxed">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>IDENTITY VERIFICATION ERROR: KYC clearance is required before booking active grid vehicles.</span>
          </div>
          <a
            href="/kyc"
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold text-center hover:bg-amber-400 transition-colors uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            Clear KYC
          </a>
        </div>
      )}

      {/* Success Message */}
      {bookingSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 font-mono text-xs">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          TRANSACTION APPROVED: Acquisition complete. Host nodes has been synced.
        </div>
      )}

      {/* Results Section */}
      {searched && !loading && (
        <>
          {bikes.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6 border-b border-slate-900 pb-3">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                  Found <span className="text-cyan-400 font-bold">{bikes.length}</span> node(s) in sector <span className="text-white font-bold">{selectedCity.toUpperCase()}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bikes.map((bike) => (
                  <BikeCard key={bike.slotId} bike={bike} onBook={handleBookClick} hideBookButton={isAdmin} kycApproved={kycApproved} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-900 rounded-2xl">
              <svg className="w-16 h-16 text-slate-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider mb-2">No Active Nodes</h3>
              <p className="text-slate-500 font-mono text-xs">
                Zero active rentals in sector {selectedCity.toUpperCase()}. Please try another coordinate.
              </p>
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-900 rounded-2xl">
          <svg className="w-16 h-16 text-slate-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider mb-2">Awaiting Parameters</h3>
          <p className="text-slate-500 font-mono text-xs">
            Scan a sector city above to establish connections.
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

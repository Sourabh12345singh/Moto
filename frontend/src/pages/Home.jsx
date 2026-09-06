import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white dark:bg-slate-950 text-neutral-800 dark:text-slate-100 min-h-screen selection:bg-rose-100 dark:selection:bg-rose-950/30 selection:text-rose-600 dark:selection:text-rose-400 transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative py-20 bg-neutral-50 dark:bg-slate-900 border-b border-neutral-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Pill Tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 mb-6 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Premium Peer-to-Peer Bike Sharing
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 font-sans">
              Rent Premium Bikes From{' '}
              <span className="text-rose-500">
                Verified Local Owners
              </span>
            </h1>

            <p className="text-lg text-neutral-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
              MotoShare matches verified bike owners with riding enthusiasts. Find your dream ride, lock in your slot, and set off instantly.
            </p>

            {/* Airbnb-style Search Widget */}
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl md:rounded-full shadow-lg border border-neutral-200 dark:border-slate-700 p-2 flex flex-col md:flex-row items-center justify-between gap-2 mt-8">
              <div className="flex-1 w-full text-left px-5 py-2 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-slate-700">
                <label className="block text-[9px] font-bold text-neutral-400 dark:text-slate-500 uppercase tracking-wider">Where</label>
                <input
                  type="text"
                  placeholder="Search cities (e.g. Delhi, Mumbai)"
                  className="w-full text-sm font-semibold text-neutral-800 dark:text-white focus:outline-none bg-transparent placeholder-neutral-400 dark:placeholder-slate-500 mt-0.5"
                />
              </div>
              <div className="flex-1 w-full text-left px-5 py-2 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-slate-700">
                <label className="block text-[9px] font-bold text-neutral-400 dark:text-slate-500 uppercase tracking-wider">Start Date</label>
                <input
                  type="text"
                  placeholder="Choose date"
                  onFocus={(e) => e.target.type = 'date'}
                  className="w-full text-sm font-semibold text-neutral-800 dark:text-white focus:outline-none bg-transparent mt-0.5 placeholder-neutral-400 dark:placeholder-slate-500"
                />
              </div>
              <div className="flex-1 w-full text-left px-5 py-2">
                <label className="block text-[9px] font-bold text-neutral-400 dark:text-slate-500 uppercase tracking-wider">End Date</label>
                <input
                  type="text"
                  placeholder="Choose date"
                  onFocus={(e) => e.target.type = 'date'}
                  className="w-full text-sm font-semibold text-neutral-800 dark:text-white focus:outline-none bg-transparent mt-0.5 placeholder-neutral-400 dark:placeholder-slate-500"
                />
              </div>
              <Link
                to="/search"
                className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white font-bold p-3.5 rounded-full flex items-center justify-center space-x-2 transition-colors duration-200 md:aspect-square"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="md:hidden text-sm">Search Rides</span>
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="py-6 border-b border-neutral-100 dark:border-slate-800 overflow-x-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center space-x-12 min-w-max">
          {[
            { name: 'Cruiser', icon: '🏍️' },
            { name: 'Sportbike', icon: '⚡' },
            { name: 'Scooter', icon: '🛵' },
            { name: 'Adventure', icon: '⛰️' },
            { name: 'Commuter', icon: '🚲' },
            { name: 'Electric', icon: '🔋' },
          ].map((cat) => (
            <Link
              key={cat.name}
              to="/search"
              className="flex flex-col items-center space-y-1.5 border-b-2 border-transparent hover:border-rose-500 pb-2 text-neutral-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-200"
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-xs font-bold">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white dark:bg-slate-950 border-b border-neutral-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Simple 3-Step Operations
            </h2>
            <p className="text-neutral-500 dark:text-slate-400 mt-2 font-medium">
              Seamlessly find, book, and unlock your vehicle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl p-8 hover:shadow-md dark:hover:shadow-slate-950/30 transition-shadow duration-300">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">1. Find a Bike</h3>
              <p className="text-neutral-500 dark:text-slate-400 leading-relaxed text-sm">
                Search available listings in your city. Filter by vehicle type, availability, and pricing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl p-8 hover:shadow-md dark:hover:shadow-slate-950/30 transition-shadow duration-300">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">2. Reserve Slot</h3>
              <p className="text-neutral-500 dark:text-slate-400 leading-relaxed text-sm">
                Reserve your timing blocks securely using our real-time synchronization checks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl p-8 hover:shadow-md dark:hover:shadow-slate-950/30 transition-shadow duration-300">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">3. Start Riding</h3>
              <p className="text-neutral-500 dark:text-slate-400 leading-relaxed text-sm">
                Retrieve keys from the host, perform a swift precheck, and set off on your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Owners Section */}
      <section className="py-20 bg-neutral-50 dark:bg-slate-900/40 border-b border-neutral-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <span className="text-rose-500 dark:text-rose-400 font-bold text-xs tracking-wider uppercase mb-2 block">Hosting console</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white mb-6">
                Monetize your idle vehicle
              </h2>
              <p className="text-neutral-500 dark:text-slate-400 mb-8 font-normal leading-relaxed text-base">
                List your motorcycles or scooters on MotoShare, define customized availability slots, and start generating payouts instantly.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="p-1 rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mr-3 mt-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <strong className="text-neutral-800 dark:text-slate-200 text-sm block">Flexible Pricing Control</strong>
                    <span className="text-xs text-neutral-500 dark:text-slate-400">Set custom hourly rates depending on seasonal demands.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="p-1 rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mr-3 mt-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <strong className="text-neutral-800 dark:text-slate-200 text-sm block">Complete Slot Controls</strong>
                    <span className="text-xs text-neutral-500 dark:text-slate-400">Enable booking slots only when you do not need the vehicle.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="p-1 rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mr-3 mt-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <strong className="text-neutral-800 dark:text-slate-200 text-sm block">Double-Factor Verification</strong>
                    <span className="text-xs text-neutral-500 dark:text-slate-400">Every user passes strict KYC and email verification checks.</span>
                  </div>
                </li>
              </ul>

              <Link
                to="/register"
                className="inline-block bg-neutral-900 hover:bg-neutral-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-100 font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
              >
                Become a Host
              </Link>
            </div>

            {/* Rates Estimation Card */}
            <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-md">
              <div className="absolute top-4 right-4 text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-900/30 uppercase tracking-wider">
                Average Estimates
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-6 pb-4 border-b border-neutral-100 dark:border-slate-800">
                Popular Host Rates
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Royal Enfield Classic 350', type: 'Heavy Cruiser', price: '₹70/hr' },
                  { name: 'Honda Activa 6G', type: 'Urban Scooter', price: '₹40/hr' },
                  { name: 'KTM Duke 200', type: 'Sports bike', price: '₹60/hr' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-slate-850/50 border border-neutral-100 dark:border-slate-800 rounded-2xl">
                    <div>
                      <span className="text-neutral-800 dark:text-slate-200 text-sm font-semibold block">{item.name}</span>
                      <span className="text-[10px] text-neutral-400 dark:text-slate-500 font-bold uppercase">{item.type}</span>
                    </div>
                    <span className="text-rose-500 dark:text-rose-450 font-bold text-sm">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Active Cities Section */}
      <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Active Rental Sectors
            </h2>
            <p className="text-neutral-500 dark:text-slate-400 mt-2 font-medium">
              Find bikes in key travel destinations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'].map((city) => (
              <Link
                key={city}
                to="/search"
                className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-550 rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md dark:hover:shadow-slate-950/45 group"
              >
                <span className="text-neutral-700 dark:text-slate-200 group-hover:text-rose-500 dark:group-hover:text-rose-400 font-bold text-sm transition-colors duration-200">
                  {city}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative bg-neutral-900 dark:bg-slate-900 text-white overflow-hidden border-t border-neutral-800 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            Ready to explore?
          </h2>
          <p className="text-neutral-400 dark:text-slate-400 mb-10 max-w-xl mx-auto font-light">
            Register today to find verified vehicles or monetize your idle asset in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors duration-200 shadow-md text-center"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-neutral-800 dark:bg-slate-800 hover:bg-neutral-750 dark:hover:bg-slate-705 text-white border border-neutral-700 dark:border-slate-700 px-8 py-3.5 rounded-full font-bold transition-colors duration-200 text-center"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors duration-200 shadow-md text-center"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;

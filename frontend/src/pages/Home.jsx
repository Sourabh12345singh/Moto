import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-slate-950 text-slate-100 overflow-hidden relative font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* High-tech Cyber Grid Background Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>
      
      {/* Glowing Neon Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Cyber Pill Tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/5 border border-cyan-500/20 mb-6 uppercase shadow-[0_0_15px_rgba(6,180,212,0.1)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Next-Gen P2P Bike Network
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
              Rent Premium Bikes From{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,180,212,0.2)]">
                Local Owners
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              MotoShare merges hardware access with decentralized sharing. 
              Find verified riders, locate a slot in your grid, unlock, and ride.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(6,180,212,0.4)] text-center"
                  >
                    Initialize Account
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 px-8 py-3.5 rounded-xl font-bold text-lg transition-all duration-300 backdrop-blur-sm text-center"
                  >
                    Authenticate
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(6,180,212,0.4)] text-center"
                >
                  Access Main Console
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 relative border-b border-slate-900 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide">
              Interface Operations
            </h2>
            <p className="text-slate-500 font-mono text-sm tracking-wider uppercase mt-2">
              Three-step integration flow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 hover:border-cyan-500/30 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 group shadow-lg">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(6,180,212,0.1)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-mono">01. Query Grid</h3>
              <p className="text-slate-400 leading-relaxed font-light text-sm">
                Locate active vehicles in your immediate geographic coordinates. Filter by available slots.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 hover:border-cyan-500/30 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 group shadow-lg">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(6,180,212,0.1)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-mono">02. Acquire Slot</h3>
              <p className="text-slate-400 leading-relaxed font-light text-sm">
                Reserve your target timespan with our secure pessimistic concurrency locking architecture.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 hover:border-cyan-500/30 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 group shadow-lg">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(6,180,212,0.1)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-mono">03. Ignition</h3>
              <p className="text-slate-400 leading-relaxed font-light text-sm">
                Acquire physical bike access from host, complete hardware pre-check, and initiate departure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Owners Section */}
      <section className="py-24 relative border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <span className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase mb-2 block">Host Terminal</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                Monetize Idle Hardware
              </h2>
              <p className="text-slate-400 mb-8 font-light leading-relaxed">
                Connect your bikes to the grid, declare customized availability slots, and start generating local currency payouts automatically.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start text-slate-300">
                  <span className="p-0.5 rounded-full bg-cyan-500/20 text-cyan-400 mr-3 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <strong className="text-white block font-mono text-sm">DYNAMIC PRICING CONTROL</strong>
                    <span className="text-sm text-slate-400">Set custom hourly rates mapped to demand vectors.</span>
                  </div>
                </li>
                <li className="flex items-start text-slate-300">
                  <span className="p-0.5 rounded-full bg-cyan-500/20 text-cyan-400 mr-3 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <strong className="text-white block font-mono text-sm">SLOT MANAGEMENT SECTOR</strong>
                    <span className="text-sm text-slate-400">Configure exact calendar boundaries for renting.</span>
                  </div>
                </li>
                <li className="flex items-start text-slate-300">
                  <span className="p-0.5 rounded-full bg-cyan-500/20 text-cyan-400 mr-3 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <strong className="text-white block font-mono text-sm">SECURE KYC CLEARANCE</strong>
                    <span className="text-sm text-slate-400">Restricted renting strictly to users clearing double-factor validation.</span>
                  </div>
                </li>
              </ul>

              <Link
                to="/register"
                className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold border border-slate-800 hover:border-cyan-500/40 px-6 py-3 rounded-xl transition-all duration-300"
              >
                Register Hardware Node
              </Link>
            </div>

            {/* Premium Techy Stats Card */}
            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-900 rounded-3xl p-8 relative shadow-2xl">
              <div className="absolute top-4 right-4 text-xs font-mono text-cyan-400 bg-cyan-400/5 px-2 py-1 border border-cyan-400/10 rounded uppercase tracking-widest animate-pulse">
                Live Grid Feeds
              </div>
              <h3 className="text-lg font-bold text-white font-mono mb-6 pb-4 border-b border-slate-900">
                Grid Estimations (Standard Rates)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-900 hover:border-cyan-500/20 rounded-xl transition-colors duration-200">
                  <div>
                    <span className="text-white font-medium block">Royal Enfield Classic 350</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Heavy Cruise</span>
                  </div>
                  <span className="text-cyan-400 font-mono font-bold">Rs 50/hr</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-900 hover:border-cyan-500/20 rounded-xl transition-colors duration-200">
                  <div>
                    <span className="text-white font-medium block">Honda Activa 6G</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Urban Scooter</span>
                  </div>
                  <span className="text-cyan-400 font-mono font-bold">Rs 30/hr</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-900 hover:border-cyan-500/20 rounded-xl transition-colors duration-200">
                  <div>
                    <span className="text-white font-medium block">TVS Apache RTR 160</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Sports Commuter</span>
                  </div>
                  <span className="text-cyan-400 font-mono font-bold">Rs 40/hr</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-24 relative bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-wide">
              Active Server Grids
            </h2>
            <p className="text-slate-500 font-mono text-sm tracking-wider uppercase mt-2">
              Select geographic sector
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {['Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'].map((city) => (
              <div
                key={city}
                className="bg-slate-900/20 hover:bg-cyan-500/5 border border-slate-900/80 hover:border-cyan-500/30 rounded-xl p-5 text-center transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(6,180,212,0.1)] group"
              >
                <span className="text-slate-300 group-hover:text-cyan-400 font-semibold font-mono transition-colors duration-300">
                  {city.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden border-t border-slate-900">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-indigo-950/20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            Establish Server Connection Now
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto font-light leading-relaxed">
            Join the node network of verified bike rental hosts and riders today.
          </p>
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-10 py-4 rounded-xl text-lg transition-all duration-300 shadow-[0_0_25px_rgba(6,180,212,0.4)] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Spawn Terminal Session
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;

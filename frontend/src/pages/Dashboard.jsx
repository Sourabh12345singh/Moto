import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, refreshStatus } = useAuth();

  useEffect(() => {
    refreshStatus();
  }, []);

  // KYC Status Banner Component
  const KycStatusBanner = () => {
    if (user?.kycStatus === 'NOT_SUBMITTED') {
      return (
        <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 mb-8 text-sm leading-relaxed text-amber-800 dark:text-amber-400 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-450 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-amber-900 dark:text-amber-300 font-bold uppercase tracking-wider text-xs">KYC Verification Required</p>
                <p className="text-amber-750 dark:text-amber-400 text-xs mt-1 font-medium">
                  Please submit your identity verification documents to unlock bike booking capabilities.
                </p>
              </div>
            </div>
            <Link
              to="/kyc"
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-center transition-colors text-xs tracking-wider uppercase shadow-sm"
            >
              Verify KYC
            </Link>
          </div>
        </div>
      );
    }

    if (user?.kycStatus === 'PENDING') {
      return (
        <div className="bg-blue-50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 mb-8 text-sm leading-relaxed text-blue-800 dark:text-blue-400 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-900 dark:text-blue-300 font-bold uppercase tracking-wider text-xs">KYC Verification Pending</p>
              <p className="text-blue-750 dark:text-blue-400 text-xs mt-1 font-medium">
                Your submitted identity documents are in verification queue. ETA: 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (user?.kycStatus === 'REJECTED') {
      return (
        <div className="bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-5 mb-8 text-sm leading-relaxed text-rose-800 dark:text-rose-450 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-500 dark:text-rose-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-rose-900 dark:text-rose-300 font-bold uppercase tracking-wider text-xs">KYC Verification Failed</p>
                <p className="text-rose-750 dark:text-rose-400 text-xs mt-1 font-medium">
                  Your submission was rejected during manual validation. Please upload correct documentation.
                </p>
              </div>
            </div>
            <Link
              to="/kyc"
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-center transition-colors text-xs tracking-wider uppercase shadow-sm"
            >
              Resubmit KYC
            </Link>
          </div>
        </div>
      );
    }

    return null;
  };

  // Quick Action Card Component
  const ActionCard = ({ title, description, icon, link, buttonText, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-rose-50 dark:bg-rose-955/20 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-800',
      green: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-800',
      purple: 'bg-purple-50 dark:bg-purple-955/20 text-purple-500 dark:text-purple-400 border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-800',
      orange: 'bg-amber-50 dark:bg-amber-955/20 text-amber-500 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-800',
    };

    return (
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 p-6 rounded-2xl hover:shadow-md dark:hover:shadow-slate-950/50 transition-all duration-200 flex flex-col justify-between h-full group">
        <div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${colorClasses[color]}`}>
            {icon}
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">{title}</h3>
          <p className="text-neutral-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">{description}</p>
        </div>
        <Link
          to={link}
          className="inline-flex items-center text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-200 mt-auto"
        >
          {buttonText}
          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-neutral-50 dark:bg-slate-950 min-h-[85vh] text-neutral-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Welcome Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-neutral-500 dark:text-slate-400 mt-2 font-medium">
          {user?.role === 'BIKER' && 'Host Session · Manage listed vehicles and timings'}
          {user?.role === 'TAKER' && 'Rider Session · Find and book active rental vehicles'}
          {user?.role === 'ADMIN' && 'Administrator Session · Verify KYC and listings'}
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 p-6 rounded-3xl mb-8 shadow-sm dark:shadow-slate-950/20">
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{user?.name}</h2>
              <p className="text-neutral-400 dark:text-slate-500 text-sm font-medium mt-0.5">{user?.email}</p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3 text-[10px] font-bold tracking-wider uppercase">
                <span className={`px-2.5 py-1 rounded-full border ${
                  user?.role === 'BIKER' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-105 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                  user?.role === 'TAKER' ? 'bg-rose-50 dark:bg-rose-955/20 border-rose-105 dark:border-rose-900/30 text-rose-600 dark:text-rose-400' :
                  'bg-purple-50 dark:bg-purple-955/20 border-purple-105 dark:border-purple-900/30 text-purple-700 dark:text-purple-400'
                }`}>
                  ROLE: {user?.role}
                </span>
                <span className={`px-2.5 py-1 rounded-full border ${
                  user?.kycStatus === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                  user?.kycStatus === 'PENDING' ? 'bg-blue-50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400' :
                  user?.kycStatus === 'REJECTED' ? 'bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400' :
                  'bg-neutral-100 dark:bg-slate-800 border-neutral-200 dark:border-slate-700 text-neutral-400 dark:text-slate-500'
                }`}>
                  KYC: {user?.kycStatus || 'NOT_SUBMITTED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Status Banner */}
      <KycStatusBanner />

      {/* Quick Actions Grid */}
      <h2 className="text-xs font-bold tracking-wider text-neutral-400 dark:text-slate-500 uppercase mb-4">Operations Center</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* TAKER Actions */}
        {user?.role === 'TAKER' && (
          <>
            <ActionCard
              title="Locate Bikes"
              description="Scan available peer-to-peer vehicles in active destinations."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              link="/search"
              buttonText="Browse Vehicles"
              color="primary"
            />
            <ActionCard
              title="Active Bookings"
              description="Monitor active locks, check slots, and view verification codes."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              link="/my-bookings"
              buttonText="My Rentals"
              color="green"
            />
          </>
        )}

        {/* BIKER Actions */}
        {user?.role === 'BIKER' && (
          <>
            <ActionCard
              title="Hardware Nodes"
              description="Manage listed vehicles, edit availability slots, and track payouts."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              link="/my-bikes"
              buttonText="My Vehicles"
              color="green"
            />
            <ActionCard
              title="List a Bike"
              description="Register new vehicle specifications and location coordinates."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }
              link="/add-bike"
              buttonText="List Vehicle"
              color="purple"
            />
          </>
        )}

        {/* ADMIN Actions */}
        {user?.role === 'ADMIN' && (
          <>
            <ActionCard
              title="KYC Validation"
              description="Audit user credentials, check driver licenses, and verify requests."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              link="/admin/kyc"
              buttonText="Audit Panel"
              color="orange"
            />
            <ActionCard
              title="Platform Network"
              description="Review global active listings, timeslots, and verify bookings."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              link="/search"
              buttonText="Browse Listings"
              color="primary"
            />
          </>
        )}

        {/* KYC Submission - for BIKER and TAKER without KYC */}
        {user?.role !== 'ADMIN' && user?.kycStatus !== 'APPROVED' && user?.kycStatus !== 'PENDING' && (
          <ActionCard
            title="Identity Check"
            description="Upload driver documentation to clear permissions and unlock bookings."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            }
            link="/kyc"
            buttonText="Verify Profile"
            color="orange"
          />
        )}
      </div>

      {/* Help Section */}
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-slate-950/20">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 pb-2 border-b border-neutral-100 dark:border-slate-800">
          Onboarding Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
          {user?.role === 'TAKER' && (
            <>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">1</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Verify identity by uploading clear documentation in the KYC panel.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">2</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Browse nearby vehicle nodes by filtering active locations in search.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">3</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Reserve slots securely using real-time booking updates.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">4</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Collect the keys from your host and initiate your trip!</p>
              </div>
            </>
          )}
          {user?.role === 'BIKER' && (
            <>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">1</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Submit KYC details to obtain host approval privileges.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">2</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Register vehicle parameters including photos, location, and plates.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">3</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Configure availability blocks and competitive hourly pricing.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">4</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Earn revenue payouts automatically as takers book your slots.</p>
              </div>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">1</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Audit pending KYC license uploads submitted by users.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">2</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Approve or reject submissions after manual visual verification.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">3</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Scan listed vehicles and active bookings in the system.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-rose-200 dark:border-rose-900/50 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 rounded-full flex items-center justify-center font-bold mr-3 text-xs">4</span>
                <p className="text-neutral-500 dark:text-slate-400 text-xs font-semibold">Resolve system queries and coordinate operations.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

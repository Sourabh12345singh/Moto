import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, refreshStatus } = useAuth();

  // Refresh user status from DB on mount so KYC banner auto-updates
  useEffect(() => {
    refreshStatus();
  }, []);

  // KYC Status Banner Component
  const KycStatusBanner = () => {
    if (user?.kycStatus === 'NOT_SUBMITTED') {
      return (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 mb-8 font-mono text-xs leading-relaxed text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.05)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-yellow-400 font-bold uppercase tracking-wider">KYC protocol not verified</p>
                <p className="text-yellow-600/80 text-[11px] mt-1">
                  Submit identify verification documents to unlock reservation capabilities.
                </p>
              </div>
            </div>
            <Link
              to="/kyc"
              className="w-full sm:w-auto px-5 py-2.5 bg-yellow-500 text-slate-950 rounded-xl font-bold text-center hover:bg-yellow-400 transition-all duration-300 uppercase tracking-widest text-[10px] shadow-[0_0_10px_rgba(234,179,8,0.2)]"
            >
              Submit KYC
            </Link>
          </div>
        </div>
      );
    }

    if (user?.kycStatus === 'PENDING') {
      return (
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-5 mb-8 font-mono text-xs leading-relaxed text-cyan-400 shadow-[0_0_15px_rgba(6,180,212,0.05)]">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-cyan-400 font-bold uppercase tracking-wider">KYC verification pending</p>
              <p className="text-cyan-600/80 text-[11px] mt-1">
                Your submitted identity documents are in verification queue. ETA: 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (user?.kycStatus === 'REJECTED') {
      return (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 mb-8 font-mono text-xs leading-relaxed text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-rose-400 font-bold uppercase tracking-wider">KYC validation failed</p>
                <p className="text-rose-600/80 text-[11px] mt-1">
                  Rejected during administrator verification. Please upload correct documentation.
                </p>
              </div>
            </div>
            <Link
              to="/kyc"
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-500 text-slate-950 rounded-xl font-bold text-center hover:bg-rose-400 transition-all duration-300 uppercase tracking-widest text-[10px] shadow-[0_0_10px_rgba(244,63,94,0.2)]"
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
      primary: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/10 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,180,212,0.15)]',
      green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10 hover:border-indigo-500/40 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]',
      orange: 'bg-amber-500/10 text-amber-400 border-amber-500/10 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    };

    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full group hover:border-slate-700 shadow-md">
        <div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 transition-all duration-300 ${colorClasses[color]}`}>
            {icon}
          </div>
          <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wide mb-2">{title}</h3>
          <p className="text-slate-400 text-sm font-light leading-relaxed mb-6">{description}</p>
        </div>
        <Link
          to={link}
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-mono text-xs tracking-wider uppercase group-hover:translate-x-1 transition-transform duration-200 mt-auto"
        >
          {buttonText}
          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-950 min-h-[85vh] text-slate-100 font-sans relative">
      
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-wider font-mono uppercase">
          Core <span className="text-cyan-400">DashboardConsole</span>
        </h1>
        <p className="text-slate-500 mt-2 font-mono text-xs tracking-widest uppercase">
          {user?.role === 'BIKER' && 'Host session: managing listed hardware nodes'}
          {user?.role === 'TAKER' && 'Rider session: scanning active network vehicles'}
          {user?.role === 'ADMIN' && 'Root session: monitoring global platform nodes'}
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-3xl mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 rounded-2xl flex items-center justify-center text-2xl font-bold font-mono shadow-[0_0_15px_rgba(6,180,212,0.3)]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wide font-mono">{user?.name}</h2>
              <p className="text-slate-500 font-mono text-sm mt-0.5">{user?.email}</p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3 font-mono text-[10px] tracking-widest uppercase">
                <span className={`px-2.5 py-1 rounded-md border font-bold ${
                  user?.role === 'BIKER' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  user?.role === 'TAKER' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                  'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                }`}>
                  ROLE: {user?.role}
                </span>
                <span className={`px-2.5 py-1 rounded-md border font-bold ${
                  user?.kycStatus === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse' :
                  user?.kycStatus === 'PENDING' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                  user?.kycStatus === 'REJECTED' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                  'bg-slate-900 border-slate-800 text-slate-500'
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
      <h2 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase mb-4">Operations Center</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* TAKER Actions */}
        {user?.role === 'TAKER' && (
          <>
            <ActionCard
              title="Locate Bikes"
              description="Scan coordinates of active, nearby vehicles in selected sectors."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              link="/search"
              buttonText="Scan Grid"
              color="primary"
            />
            <ActionCard
              title="Active Bookings"
              description="Monitor active locks, upcoming slots, and verify departures."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              link="/my-bookings"
              buttonText="View Console"
              color="green"
            />
          </>
        )}

        {/* BIKER Actions */}
        {user?.role === 'BIKER' && (
          <>
            <ActionCard
              title="Hardware Nodes"
              description="Oversee listed vehicles, configure slots, and monitor earnings."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              link="/my-bikes"
              buttonText="Grid Control"
              color="green"
            />
            <ActionCard
              title="Spawn Node"
              description="Register new vehicle coordinates to grid list."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
              link="/add-bike"
              buttonText="Register Bike"
              color="purple"
            />
          </>
        )}

        {/* ADMIN Actions */}
        {user?.role === 'ADMIN' && (
          <>
            <ActionCard
              title="KYC Clearance"
              description="Audit user credentials, check licenses, and verify/reject clearances."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              link="/admin/kyc"
              buttonText="Audit Terminal"
              color="orange"
            />
            <ActionCard
              title="Platform Network"
              description="Scan overall listings, slots, and verify vehicle status."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              link="/search"
              buttonText="Browse Nodes"
              color="primary"
            />
          </>
        )}

        {/* KYC Submission - for BIKER and TAKER without KYC */}
        {user?.role !== 'ADMIN' && user?.kycStatus !== 'APPROVED' && user?.kycStatus !== 'PENDING' && (
          <ActionCard
            title="Submit Identity"
            description="Clear identity check parameters to obtain permission authorization."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            }
            link="/kyc"
            buttonText="Submit KYC"
            color="orange"
          />
        )}
      </div>

      {/* Help Section */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 font-mono text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-900">
          Grid Onboarding Protocols
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
          {user?.role === 'TAKER' && (
            <>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-cyan-500/30 text-cyan-400 bg-cyan-500/5 rounded-lg flex items-center justify-center font-bold mr-3">1</span>
                <p className="text-slate-400">Authenticate identity: upload license and identification data.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-cyan-500/30 text-cyan-400 bg-cyan-500/5 rounded-lg flex items-center justify-center font-bold mr-3">2</span>
                <p className="text-slate-400">Establish grid connection: locate vehicle nodes by sector coordinates.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-cyan-500/30 text-cyan-400 bg-cyan-500/5 rounded-lg flex items-center justify-center font-bold mr-3">3</span>
                <p className="text-slate-400">Lock timespan bounds: finalize vehicle reservation slots.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-cyan-500/30 text-cyan-400 bg-cyan-500/5 rounded-lg flex items-center justify-center font-bold mr-3">4</span>
                <p className="text-slate-400">Execute ignition: confirm physical pickup with node owner.</p>
              </div>
            </>
          )}
          {user?.role === 'BIKER' && (
            <>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 rounded-lg flex items-center justify-center font-bold mr-3">1</span>
                <p className="text-slate-400">Validate identity credentials via administration.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 rounded-lg flex items-center justify-center font-bold mr-3">2</span>
                <p className="text-slate-400">Provision vehicle parameters (model, register plate, registration rc).</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 rounded-lg flex items-center justify-center font-bold mr-3">3</span>
                <p className="text-slate-400">Configure availability slot durations and prices per hour.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 rounded-lg flex items-center justify-center font-bold mr-3">4</span>
                <p className="text-slate-400">Recruit currency payout streams as riders book hardware nodes.</p>
              </div>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-indigo-500/30 text-indigo-400 bg-indigo-500/5 rounded-lg flex items-center justify-center font-bold mr-3">1</span>
                <p className="text-slate-400">Audit pending KYC submissions uploaded by grid nodes.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-indigo-500/30 text-indigo-400 bg-indigo-500/5 rounded-lg flex items-center justify-center font-bold mr-3">2</span>
                <p className="text-slate-400">Sign off or reject credentials after manual image review.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-indigo-500/30 text-indigo-400 bg-indigo-500/5 rounded-lg flex items-center justify-center font-bold mr-3">3</span>
                <p className="text-slate-400">Monitor overall listings registered across global systems.</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 border border-indigo-500/30 text-indigo-400 bg-indigo-500/5 rounded-lg flex items-center justify-center font-bold mr-3">4</span>
                <p className="text-slate-400">Resolve database queries and concurrency locks.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

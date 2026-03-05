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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-yellow-800 font-medium">Complete Your KYC</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Verify your identity to access all features
                </p>
              </div>
            </div>
            <Link
              to="/kyc"
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              Submit KYC
            </Link>
          </div>
        </div>
      );
    }

    if (user?.kycStatus === 'PENDING') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-800 font-medium">KYC Under Review</p>
              <p className="text-blue-700 text-sm mt-1">
                Your documents are being verified. This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (user?.kycStatus === 'REJECTED') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-800 font-medium">KYC Rejected</p>
                <p className="text-red-700 text-sm mt-1">
                  Please resubmit your documents with correct information.
                </p>
              </div>
            </div>
            <Link
              to="/kyc"
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
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
      primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
      green: 'bg-green-50 text-green-600 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    };

    return (
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <Link
          to={link}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          {buttonText}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'BIKER' && 'Manage your bikes and track your earnings'}
          {user?.role === 'TAKER' && 'Find and book bikes in your city'}
          {user?.role === 'ADMIN' && 'Manage users and KYC verifications'}
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex items-center mt-1 space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'BIKER' ? 'bg-green-100 text-green-800' :
                  user?.role === 'TAKER' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {user?.role}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  user?.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  user?.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* TAKER Actions */}
        {user?.role === 'TAKER' && (
          <>
            <ActionCard
              title="Find Bikes"
              description="Search for available bikes in your city and book instantly"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              link="/search"
              buttonText="Search Bikes"
              color="primary"
            />
            <ActionCard
              title="My Bookings"
              description="View your upcoming and past bike bookings"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              link="/my-bookings"
              buttonText="View Bookings"
              color="green"
            />
          </>
        )}

        {/* BIKER Actions */}
        {user?.role === 'BIKER' && (
          <>
            <ActionCard
              title="My Bikes"
              description="View and manage your listed bikes and availability slots"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              link="/my-bikes"
              buttonText="View My Bikes"
              color="green"
            />
            <ActionCard
              title="Add New Bike"
              description="List a new bike and start earning from rentals"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
              link="/add-bike"
              buttonText="Add Bike"
              color="purple"
            />
          </>
        )}

        {/* ADMIN Actions */}
        {user?.role === 'ADMIN' && (
          <>
            <ActionCard
              title="KYC Management"
              description="Review and approve pending KYC verifications"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              link="/admin/kyc"
              buttonText="Manage KYC"
              color="orange"
            />
            <ActionCard
              title="Browse Bikes"
              description="View all available bikes across cities"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              link="/search"
              buttonText="View Bikes"
              color="primary"
            />
          </>
        )}

        {/* KYC Submission - for BIKER and TAKER without KYC */}
        {user?.role !== 'ADMIN' && user?.kycStatus !== 'APPROVED' && user?.kycStatus !== 'PENDING' && (
          <ActionCard
            title="Complete KYC"
            description="Verify your identity to unlock all platform features"
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
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {user?.role === 'TAKER' && (
            <>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                <p className="text-gray-600 text-sm">Complete your KYC verification to book bikes</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                <p className="text-gray-600 text-sm">Search for bikes in your city</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                <p className="text-gray-600 text-sm">Select a time slot and confirm booking</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                <p className="text-gray-600 text-sm">Pick up the bike and enjoy your ride!</p>
              </div>
            </>
          )}
          {user?.role === 'BIKER' && (
            <>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                <p className="text-gray-600 text-sm">Complete your KYC verification</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                <p className="text-gray-600 text-sm">Add your bike details (model, registration, etc.)</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                <p className="text-gray-600 text-sm">Create availability slots with pricing</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                <p className="text-gray-600 text-sm">Start earning when riders book your bike!</p>
              </div>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                <p className="text-gray-600 text-sm">Review pending KYC submissions from users</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                <p className="text-gray-600 text-sm">Approve or reject KYC documents after verification</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                <p className="text-gray-600 text-sm">Browse available bikes across all cities</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                <p className="text-gray-600 text-sm">Monitor platform activity and listings</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

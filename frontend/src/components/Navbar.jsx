import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,180,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,180,212,0.6)] transition-all duration-300">
                <svg className="w-6 h-6 text-slate-950 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xl font-mono font-bold tracking-wider text-white bg-clip-text group-hover:text-cyan-400 transition-colors duration-300">
                MOTO<span className="text-cyan-400 group-hover:text-white transition-colors duration-300">SHARE</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all duration-300 shadow-[0_0_15px_rgba(6,180,212,0.3)] hover:shadow-[0_0_20px_rgba(6,180,212,0.5)] transform active:scale-95"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>

                {hasRole(['TAKER', 'ADMIN']) && (
                  <Link
                    to="/search"
                    className="text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Find Bikes
                  </Link>
                )}
                {hasRole('TAKER') && (
                  <Link
                    to="/my-bookings"
                    className="text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    My Bookings
                  </Link>
                )}

                {hasRole('BIKER') && (
                  <>
                    <Link
                      to="/my-bikes"
                      className="text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      My Bikes
                    </Link>
                    <Link
                      to="/add-bike"
                      className="text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Add Bike
                    </Link>
                  </>
                )}

                {hasRole('ADMIN') && (
                  <Link
                    to="/admin/kyc"
                    className="text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    KYC Admin
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-slate-800">
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{user?.name}</p>
                    <p className="text-cyan-400 text-[10px] font-mono tracking-widest uppercase">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-rose-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-slate-950 border-b border-slate-900 px-2 pt-2 pb-4 space-y-1 transition-all duration-300`}>
        {!isAuthenticated ? (
          <>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-cyan-400 px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="block bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-center px-4 py-2.5 rounded-md text-base transition-colors duration-200 shadow-sm"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <div className="px-3 py-2 mb-2 border-b border-slate-900 flex justify-between items-center">
              <div>
                <p className="text-white text-base font-semibold">{user?.name}</p>
                <p className="text-cyan-400 text-xs font-mono tracking-wider uppercase">{user?.role}</p>
              </div>
            </div>

            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            >
              Dashboard
            </Link>

            {hasRole(['TAKER', 'ADMIN']) && (
              <Link
                to="/search"
                onClick={() => setIsOpen(false)}
                className="block text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                Find Bikes
              </Link>
            )}

            {hasRole('TAKER') && (
              <Link
                to="/my-bookings"
                onClick={() => setIsOpen(false)}
                className="block text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                My Bookings
              </Link>
            )}

            {hasRole('BIKER') && (
              <>
                <Link
                  to="/my-bikes"
                  onClick={() => setIsOpen(false)}
                  className="block text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  My Bikes
                </Link>
                <Link
                  to="/add-bike"
                  onClick={() => setIsOpen(false)}
                  className="block text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Add Bike
                </Link>
              </>
            )}

            {hasRole('ADMIN') && (
              <Link
                to="/admin/kyc"
                onClick={() => setIsOpen(false)}
                className="block text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                KYC Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="block w-full text-left text-rose-400 hover:text-rose-500 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

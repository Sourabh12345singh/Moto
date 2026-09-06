import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <nav className="bg-white dark:bg-slate-900 border-b border-neutral-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-1 group">
              <span className="text-2xl font-extrabold tracking-tight text-rose-500 font-sans">
                moto<span className="text-neutral-900 dark:text-white">Share</span>
              </span>
            </Link>
          </div>

          {/* Airbnb-style Search Pill (Desktop) */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-8">
            <Link to="/search" className="flex items-center justify-between w-full border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full px-5 py-2 hover:shadow-md dark:hover:shadow-slate-950/50 transition-all duration-200 cursor-pointer shadow-sm">
              <span className="text-xs font-semibold text-neutral-800 dark:text-slate-200">Search city</span>
              <span className="text-neutral-300 dark:text-slate-650">|</span>
              <span className="text-xs font-semibold text-neutral-500 dark:text-slate-400">Any slot</span>
              <span className="text-neutral-300 dark:text-slate-650">|</span>
              <span className="text-xs font-medium text-neutral-400 dark:text-slate-500">Add filters</span>
              <div className="p-1.5 rounded-full bg-rose-500 text-white ml-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none mr-2"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
            </button>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="text-neutral-800 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                >
                  Become a Host
                </Link>
                <Link
                  to="/login"
                  className="text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="ml-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all duration-200 shadow-sm active:scale-95"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                >
                  Dashboard
                </Link>

                {hasRole(['TAKER', 'ADMIN']) && (
                  <Link
                    to="/search"
                    className="text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                  >
                    Find Bikes
                  </Link>
                )}
                {hasRole('TAKER') && (
                  <Link
                    to="/my-bookings"
                    className="text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                  >
                    My Bookings
                  </Link>
                )}

                {hasRole('BIKER') && (
                  <>
                    <Link
                      to="/my-bikes"
                      className="text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                    >
                      My Bikes
                    </Link>
                    <Link
                      to="/add-bike"
                      className="text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                    >
                      Add Bike
                    </Link>
                  </>
                )}

                {hasRole('ADMIN') && (
                  <Link
                    to="/admin/kyc"
                    className="text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                  >
                    KYC Admin
                  </Link>
                )}

                {/* User Dropdown Profile Pill */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-neutral-200 dark:border-slate-800">
                  <div className="text-right">
                    <p className="text-neutral-800 dark:text-slate-100 text-sm font-semibold">{user?.name}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 uppercase">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-neutral-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Actions Container */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Theme Toggle Button Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 focus:outline-none transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white dark:bg-slate-900 border-b border-neutral-100 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1 transition-colors duration-200`}>
        {!isAuthenticated ? (
          <>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-2.5 rounded-lg text-base font-semibold transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="block bg-rose-500 text-white font-bold text-center px-4 py-2.5 rounded-lg text-base transition-colors duration-200 shadow-sm"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <div className="px-3 py-2.5 mb-2 border-b border-neutral-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-neutral-800 dark:text-slate-100 text-base font-semibold">{user?.name}</p>
                <p className="text-rose-500 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>

            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
            >
              Dashboard
            </Link>

            {hasRole(['TAKER', 'ADMIN']) && (
              <Link
                to="/search"
                onClick={() => setIsOpen(false)}
                className="block text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
              >
                Find Bikes
              </Link>
            )}

            {hasRole('TAKER') && (
              <Link
                to="/my-bookings"
                onClick={() => setIsOpen(false)}
                className="block text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
              >
                My Bookings
              </Link>
            )}

            {hasRole('BIKER') && (
              <>
                <Link
                  to="/my-bikes"
                  onClick={() => setIsOpen(false)}
                  className="block text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
                >
                  My Bikes
                </Link>
                <Link
                  to="/add-bike"
                  onClick={() => setIsOpen(false)}
                  className="block text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
                >
                  Add Bike
                </Link>
              </>
            )}

            {hasRole('ADMIN') && (
              <Link
                to="/admin/kyc"
                onClick={() => setIsOpen(false)}
                className="block text-neutral-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
              >
                KYC Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="block w-full text-left text-neutral-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
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

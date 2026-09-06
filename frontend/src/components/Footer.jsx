import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-slate-900 text-neutral-600 dark:text-slate-400 border-t border-neutral-150 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-extrabold tracking-tight text-rose-500">
                moto<span className="text-neutral-900 dark:text-white">Share</span>
              </span>
            </div>
            <p className="text-neutral-500 dark:text-slate-400 text-sm max-w-md">
              Connect with local bike owners and rent bikes by the hour. 
              Safe, affordable, and convenient transportation at your fingertips.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-neutral-800 dark:text-slate-200 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-neutral-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-sm transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-neutral-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-sm transition-colors font-medium">
                  Find Bikes
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-neutral-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-sm transition-colors font-medium">
                  Become a Host
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="text-xs font-bold text-neutral-800 dark:text-slate-200 uppercase tracking-wider mb-4">
              Available In
            </h3>
            <ul className="space-y-2.5 text-neutral-500 dark:text-slate-400 text-sm font-medium">
              <li>Delhi</li>
              <li>Mumbai</li>
              <li>Bangalore</li>
              <li>Jaipur</li>
              <li>Pune</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-slate-800 mt-8 pt-8 text-center">
          <p className="text-neutral-400 dark:text-slate-500 text-xs font-medium">
            &copy; {new Date().getFullYear()} motoShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

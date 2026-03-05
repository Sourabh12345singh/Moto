import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="text-xl font-bold">MotoShare</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Connect with local bike owners and rent bikes by the hour. 
              Safe, affordable, and convenient transportation at your fingertips.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Find Bikes
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Become a Biker
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
              Available In
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Delhi</li>
              <li>Mumbai</li>
              <li>Bangalore</li>
              <li>Jaipur</li>
              <li>Pune</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} MotoShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

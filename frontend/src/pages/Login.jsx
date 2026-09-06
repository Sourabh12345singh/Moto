import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(tokenResponse.code);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorResponse) => {
    console.error(errorResponse);
    setError('Google Sign-in failed. Please try again.');
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'auth-code',
  });

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-slate-400 font-medium">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Clean Card */}
        <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 py-8 px-6 sm:px-10 shadow-lg dark:shadow-slate-950/50 rounded-2xl">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 focus:border-neutral-950 dark:focus:border-white rounded-xl text-neutral-800 dark:text-white outline-none transition-all text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/register" className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 focus:border-neutral-950 dark:focus:border-white rounded-xl text-neutral-800 dark:text-white outline-none transition-all text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center justify-center font-bold">
                  <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="font-bold text-sm">Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-slate-900 text-neutral-400 dark:text-slate-500 font-bold uppercase tracking-wider">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => triggerGoogleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 hover:border-neutral-300 dark:hover:border-slate-600 text-neutral-700 dark:text-slate-200 py-3 px-4 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.47c0,-0.61 -0.05,-1.2 -0.16,-1.73z" fill="#4285F4" />
                <path d="M12,20.4c2.54,0 4.67,-0.84 6.22,-2.28l-3.3,-2.57c-0.91,0.61 -2.08,0.98 -2.92,0.98c-2.48,0 -4.58,-1.68 -5.33,-3.93H3.27v2.66c1.56,3.1 4.78,5.14 8.73,5.14z" fill="#34A853" />
                <path d="M6.67,12.6c-0.2,-0.61 -0.31,-1.26 -0.31,-1.93c0,-0.67 0.11,-1.32 0.31,-1.93V6.08H3.27c-0.78,1.56 -1.22,3.31 -1.22,5.18c0,1.87 0.44,3.62 1.22,5.18l3.4,-2.66z" fill="#FBBC05" />
                <path d="M12,5.7c1.38,0 2.62,0.47 3.59,1.4l2.69,-2.69C16.66,2.83 14.53,2 12,2C8.05,2 4.83,4.04 3.27,7.14l3.4,2.66c0.75,-2.25 2.85,-3.93 5.33,-3.93z" fill="#EA4335" />
              </g>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center text-xs font-semibold">
            <span className="text-neutral-500 dark:text-slate-450">New to motoShare? </span>
            <Link to="/register" className="text-rose-500 hover:text-rose-600 dark:text-rose-450 font-bold transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

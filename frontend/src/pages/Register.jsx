import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

function Register() {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: Registration or Password Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userExists, setUserExists] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNo: '',
    password: '',
    confirmPassword: '',
    role: 'TAKER', // Default role
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await googleLogin(tokenResponse.code, formData.role);
      setSuccess('✅ Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Google registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorResponse) => {
    console.error(errorResponse);
    setError('Google registration failed. Please try again.');
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'auth-code',
  });

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // OTP box change handler with auto-advance
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Only take last character
    setOtp(newOtp);

    // Focus next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // OTP keydown handler to support backspace back-navigation
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`).focus();
      }
    }
  };

  // Step 1: Request OTP Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.sendOtp(email);
      setUserExists(res.userExists);
      setSuccess('Verification code sent to your email successfully!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(email, otpCode);
      setUserExists(res.userExists);
      setSuccess('✅ Email Verified Successfully!');
      setTimeout(() => {
        setStep(3);
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle Final Action (Register or Reset Password)
  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      if (userExists) {
        // Reset password for existing user
        await authAPI.resetPassword(email, formData.password);
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Register new user
        // Validate phone number - must be exactly 10 digits
        const phoneNoStr = formData.phoneNo.trim();
        if (!/^\d{10}$/.test(phoneNoStr)) {
          setError('Phone number must be exactly 10 digits');
          setLoading(false);
          return;
        }

        const phoneNoNum = parseInt(phoneNoStr, 10);
        if (isNaN(phoneNoNum)) {
          setError('Invalid phone number');
          setLoading(false);
          return;
        }

        const userData = {
          name: formData.name,
          email: email,
          phoneNo: phoneNoNum,
          password: formData.password,
          role: formData.role,
        };

        await register(userData);
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Step Indicator Headers */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {step === 3 && userExists ? 'Reset Password' : 'Create Account'}
          </h2>
          <p className="mt-2 text-gray-600">
            {step === 1 && 'Step 1: Enter your email to begin'}
            {step === 2 && 'Step 2: Enter the 6-digit OTP verification code'}
            {step === 3 && (userExists ? 'Change your password' : 'Step 3: Complete your registration details')}
          </p>
        </div>

        {/* Wizard step bar */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
          <div className={`w-12 h-0.5 transition-colors ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
          <div className={`w-12 h-0.5 transition-colors ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
              {success}
            </div>
          )}

          {/* STEP 1: Email Form */}
          {step === 1 && (
            <div className="space-y-5">
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending Code...' : 'Verify Email / Send OTP'}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with Google</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
                  Select your role for Google Registration
                </label>
                <div className="flex gap-4 justify-center mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'TAKER' }))}
                    className={`flex-1 py-2 px-3 border rounded-lg text-sm font-semibold transition-all duration-200 ${
                      formData.role === 'TAKER'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Rent Bikes (Taker)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'BIKER' }))}
                    className={`flex-1 py-2 px-3 border rounded-lg text-sm font-semibold transition-all duration-200 ${
                      formData.role === 'BIKER'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    List Bikes (Biker)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => triggerGoogleLogin()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95 shadow-sm"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                      <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.47c0,-0.61 -0.05,-1.2 -0.16,-1.73z" fill="#4285F4" />
                      <path d="M12,20.4c2.54,0 4.67,-0.84 6.22,-2.28l-3.3,-2.57c-0.91,0.61 -2.08,0.98 -2.92,0.98c-2.48,0 -4.58,-1.68 -5.33,-3.93H3.27v2.66c1.56,3.1 4.78,5.14 8.73,5.14z" fill="#34A853" />
                      <path d="M6.67,12.6c-0.2,-0.61 -0.31,-1.26 -0.31,-1.93c0,-0.67 0.11,-1.32 0.31,-1.93V6.08H3.27c-0.78,1.56 -1.22,3.31 -1.22,5.18c0,1.87 0.44,3.62 1.22,5.18l3.4,-2.66z" fill="#FBBC05" />
                      <path d="M12,5.7c1.38,0 2.62,0.47 3.59,1.4l2.69,-2.69C16.66,2.83 14.53,2 12,2C8.05,2 4.83,4.04 3.27,7.14l3.4,2.66c0.75,-2.25 2.85,-3.93 5.33,-3.93z" fill="#EA4335" />
                    </g>
                  </svg>
                  Sign up with Google
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">{email}</span>.
                </p>
                <div className="flex justify-between items-center gap-2 max-w-xs mx-auto mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-10 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Final Form (Register or Reset Password) */}
          {step === 3 && (
            <form onSubmit={handleSubmitFinal} className="space-y-5">
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-800 text-xs flex items-center justify-between mb-4">
                <span>Verified Email: <strong>{email}</strong></span>
                <span className="font-semibold">✅ VERIFIED</span>
              </div>

              {userExists ? (
                /* PASSWORD RESET FLOW FOR EXISTING USERS */
                <div className="space-y-5">
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
                    An account with this email address already exists. Enter a new password below to reset your credentials and log in.
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password & Log In'}
                  </button>
                </div>
              ) : (
                /* REGISTRATION FLOW FOR NEW USERS */
                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phoneNo"
                      name="phoneNo"
                      type="tel"
                      required
                      value={formData.phoneNo}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I want to
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.role === 'TAKER'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="TAKER"
                          checked={formData.role === 'TAKER'}
                          onChange={handleFormChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="font-medium">Rent Bikes</span>
                          <p className="text-xs text-gray-500 mt-1">Find & book bikes</p>
                        </div>
                      </label>
                      <label
                        className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.role === 'BIKER'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="BIKER"
                          checked={formData.role === 'BIKER'}
                          onChange={handleFormChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">List Bikes</span>
                          <p className="text-xs text-gray-500 mt-1">Earn from your bike</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="Create a password"
                      minLength={6}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
              )}
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

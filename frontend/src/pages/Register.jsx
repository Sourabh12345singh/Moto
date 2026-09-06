import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userExists, setUserExists] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNo: '',
    password: '',
    confirmPassword: '',
    role: 'TAKER',
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
      setSuccess('Registration successful! Redirecting...');
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

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`).focus();
      }
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
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
      setSuccess('Email Verified Successfully!');
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

  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
        await authAPI.resetPassword(email, formData.password);
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {step === 3 && userExists ? 'Reset Password' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-slate-400 font-medium">
            {step === 1 && 'Step 1: Verify your email address'}
            {step === 2 && 'Step 2: Enter verification code'}
            {step === 3 && (userExists ? 'Choose a new password' : 'Step 3: Setup your profile details')}
          </p>
        </div>

        {/* Wizard Progress Dots */}
        <div className="flex items-center justify-center space-x-3 mb-8 text-xs font-semibold">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            step >= 1 ? 'border-rose-500 bg-rose-500 text-white' : 'border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-neutral-400 dark:text-slate-500'
          }`}>1</div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-slate-800'}`}></div>
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            step >= 2 ? 'border-rose-500 bg-rose-500 text-white' : 'border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-neutral-400 dark:text-slate-500'
          }`}>2</div>
          <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-slate-800'}`}></div>
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            step >= 3 ? 'border-rose-500 bg-rose-500 text-white' : 'border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-neutral-400 dark:text-slate-500'
          }`}>3</div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 py-8 px-6 sm:px-10 shadow-lg dark:shadow-slate-955/50 rounded-2xl">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-450 rounded-xl text-sm font-semibold flex items-center gap-2 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {success}
            </div>
          )}

          {/* STEP 1: Email Form */}
          {step === 1 && (
            <div className="space-y-5">
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 focus:border-neutral-955 dark:focus:border-white rounded-xl text-neutral-800 dark:text-white outline-none transition-all text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-neutral-955 dark:focus:ring-white"
                    placeholder="name@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center"
                >
                  {loading ? 'Sending code...' : 'Continue'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-slate-900 text-neutral-400 dark:text-slate-500 font-bold uppercase tracking-wider">Or</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-center">
                  Declare Role for Google Sign-up
                </label>
                <div className="flex gap-4 justify-center mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'TAKER' }))}
                    className={`flex-1 py-2 px-3 border rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                      formData.role === 'TAKER'
                        ? 'border-rose-500 bg-rose-55 dark:bg-rose-955/20 text-rose-500 dark:text-rose-400 shadow-sm'
                        : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-500 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    Rent (Taker)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'BIKER' }))}
                    className={`flex-1 py-2 px-3 border rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                      formData.role === 'BIKER'
                        ? 'border-rose-500 bg-rose-55 dark:bg-rose-955/20 text-rose-500 dark:text-rose-400 shadow-sm'
                        : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-500 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    List (Biker)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => triggerGoogleLogin()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 hover:border-neutral-350 dark:hover:border-slate-600 text-neutral-700 dark:text-slate-200 py-3 px-4 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm"
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
              <div className="text-center font-sans">
                <p className="text-xs text-neutral-500 dark:text-slate-400 mb-5 leading-relaxed">
                  We've sent a 6-digit code to <span className="font-semibold text-neutral-850 dark:text-slate-100 block mt-1">{email}</span>.
                </p>
                <div className="flex justify-between items-center gap-2 max-w-xs mx-auto mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-10 h-12 text-center text-xl font-bold bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-755 focus:border-rose-500 text-neutral-800 dark:text-white outline-none transition-all focus:ring-1 focus:ring-rose-500"
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-white dark:bg-slate-805 border border-neutral-200 dark:border-slate-700 hover:border-neutral-300 dark:hover:border-slate-600 text-neutral-600 dark:text-slate-300 py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-95 shadow-sm"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-450 dark:hover:text-rose-350 font-semibold transition-colors"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Final Form (Register or Reset Password) */}
          {step === 3 && (
            <form onSubmit={handleSubmitFinal} className="space-y-5">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between mb-4">
                <span>Email Verified: <strong>{email}</strong></span>
                <span className="font-bold tracking-widest text-[9px] bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">VERIFIED</span>
              </div>

              {userExists ? (
                /* PASSWORD RESET FLOW FOR EXISTING USERS */
                <div className="space-y-5">
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 text-amber-805 dark:text-amber-400 rounded-xl text-xs font-semibold leading-relaxed">
                    An account already exists with this email. Please set a new password below.
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 focus:border-neutral-955 dark:focus:border-white rounded-xl text-neutral-800 dark:text-white outline-none transition-all text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-neutral-955 dark:focus:ring-white"
                      placeholder="Enter new password (min. 6 chars)"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 focus:border-neutral-955 dark:focus:border-white rounded-xl text-neutral-800 dark:text-white outline-none transition-all text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-neutral-955 dark:focus:ring-white"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all active:scale-95 shadow-sm"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              ) : (
                /* REGISTRATION FLOW FOR NEW USERS */
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 focus:border-neutral-955 dark:focus:border-white rounded-xl text-neutral-800 dark:text-white outline-none transition-all text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-neutral-955 dark:focus:ring-white"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNo" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phoneNo"
                      name="phoneNo"
                      type="tel"
                      required
                      value={formData.phoneNo}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 focus:border-neutral-955 dark:focus:border-white rounded-xl text-neutral-800 dark:text-white outline-none transition-all text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-neutral-955 dark:focus:ring-white"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Register as
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all select-none ${
                          formData.role === 'TAKER'
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400'
                            : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-500 dark:text-slate-400 hover:border-neutral-300 dark:hover:border-slate-600'
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
                        <div className="text-center font-sans">
                          <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="font-bold text-sm uppercase tracking-wider block">Rent Bikes</span>
                          <p className="text-[10px] text-neutral-400 dark:text-slate-500 mt-1">Book vehicles</p>
                        </div>
                      </label>
                      <label
                        className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all select-none ${
                          formData.role === 'BIKER'
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400'
                            : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-500 dark:text-slate-400 hover:border-neutral-300 dark:hover:border-slate-600'
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
                        <div className="text-center font-sans">
                          <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-sm uppercase tracking-wider block">List Bikes</span>
                          <p className="text-[10px] text-neutral-400 dark:text-slate-500 mt-1">Become a Host</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 focus:border-neutral-955 dark:focus:border-white rounded-xl text-neutral-800 dark:text-white outline-none transition-all text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-neutral-955 dark:focus:ring-white"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 focus:border-neutral-955 dark:focus:border-white rounded-xl text-neutral-800 dark:text-white outline-none transition-all text-sm font-semibold placeholder-neutral-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-neutral-955 dark:focus:ring-white"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all active:scale-95 shadow-sm"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
              )}
            </form>
          )}

          <div className="mt-6 text-center text-xs font-semibold">
            <span className="text-neutral-500 dark:text-slate-450">Already have an account? </span>
            <Link to="/login" className="text-rose-500 hover:text-rose-600 dark:text-rose-450 font-bold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

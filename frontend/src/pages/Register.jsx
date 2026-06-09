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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden font-sans">
      
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>
      
      {/* Glow */}
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none top-1/4 right-1/4"></div>

      <div className="max-w-md w-full relative z-10">
        
        {/* Techy Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold tracking-wider text-white uppercase font-mono">
            {step === 3 && userExists ? 'Reset console' : 'Register Console'}
          </h2>
          <p className="mt-2 text-xs text-slate-500 font-mono tracking-widest uppercase">
            {step === 1 && 'STEP 01: INITIALIZE IDENTITY'}
            {step === 2 && 'STEP 02: VERIFICATION PROTOCOL'}
            {step === 3 && (userExists ? 'OVERWRITE SECURITY PASSPHRASE' : 'STEP 03: CONFIGURE CREDENTIALS')}
          </p>
        </div>

        {/* Diagnostic Status Bar */}
        <div className="flex items-center justify-center space-x-3 mb-6 font-mono text-xs">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold transition-all duration-300 ${
            step >= 1 ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,180,212,0.2)]' : 'border-slate-800 bg-slate-950 text-slate-600'
          }`}>01</div>
          <div className={`w-8 h-0.5 transition-colors ${step >= 2 ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold transition-all duration-300 ${
            step >= 2 ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,180,212,0.2)]' : 'border-slate-800 bg-slate-950 text-slate-600'
          }`}>02</div>
          <div className={`w-8 h-0.5 transition-colors ${step >= 3 ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold transition-all duration-300 ${
            step >= 3 ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,180,212,0.2)]' : 'border-slate-800 bg-slate-950 text-slate-600'
          }`}>03</div>
        </div>

        {/* Glassmorphic Container */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-mono flex items-center gap-2 justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {success}
            </div>
          )}

          {/* STEP 1: Email Form */}
          {step === 1 && (
            <div className="space-y-5">
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
                    Identity Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl text-white outline-none transition-all duration-300 font-mono text-sm focus:shadow-[0_0_15px_rgba(6,180,212,0.15)] placeholder-slate-600"
                    placeholder="you@console.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white font-mono uppercase text-sm tracking-wider border border-slate-850 hover:border-cyan-500/40 py-3 px-4 rounded-xl transition-all duration-350 shadow-sm"
                >
                  {loading ? 'Transmitting Code...' : 'Initialize Verification'}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-slate-900/50 backdrop-blur-sm text-slate-500 font-mono tracking-wider uppercase">Or Secure Link</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
                  Declare Grid Role for Google Sign-up
                </label>
                <div className="flex gap-4 justify-center mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'TAKER' }))}
                    className={`flex-1 py-2 px-3 border rounded-xl text-xs font-mono transition-all duration-200 uppercase tracking-wider ${
                      formData.role === 'TAKER'
                        ? 'border-cyan-500/80 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,180,212,0.15)]'
                        : 'border-slate-850 bg-slate-950/60 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    Rent (Taker)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'BIKER' }))}
                    className={`flex-1 py-2 px-3 border rounded-xl text-xs font-mono transition-all duration-200 uppercase tracking-wider ${
                      formData.role === 'BIKER'
                        ? 'border-cyan-500/80 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,180,212,0.15)]'
                        : 'border-slate-850 bg-slate-950/60 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    List (Biker)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => triggerGoogleLogin()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white py-3 px-4 rounded-xl font-mono text-sm tracking-wide transition-all duration-200 transform active:scale-95 hover:shadow-[0_0_15px_rgba(6,180,212,0.1)]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                      <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.47c0,-0.61 -0.05,-1.2 -0.16,-1.73z" fill="#4285F4" />
                      <path d="M12,20.4c2.54,0 4.67,-0.84 6.22,-2.28l-3.3,-2.57c-0.91,0.61 -2.08,0.98 -2.92,0.98c-2.48,0 -4.58,-1.68 -5.33,-3.93H3.27v2.66c1.56,3.1 4.78,5.14 8.73,5.14z" fill="#34A853" />
                      <path d="M6.67,12.6c-0.2,-0.61 -0.31,-1.26 -0.31,-1.93c0,-0.67 0.11,-1.32 0.31,-1.93V6.08H3.27c-0.78,1.56 -1.22,3.31 -1.22,5.18c0,1.87 0.44,3.62 1.22,5.18l3.4,-2.66z" fill="#FBBC05" />
                      <path d="M12,5.7c1.38,0 2.62,0.47 3.59,1.4l2.69,-2.69C16.66,2.83 14.53,2 12,2C8.05,2 4.83,4.04 3.27,7.14l3.4,2.66c0.75,-2.25 2.85,-3.93 5.33,-3.93z" fill="#EA4335" />
                    </g>
                  </svg>
                  Register with Google
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center font-mono">
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Verification code transmitted to email node: <span className="font-semibold text-white block mt-1">{email}</span>.
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
                      className="w-10 h-12 text-center text-xl font-bold bg-slate-950/60 border border-slate-850 focus:border-cyan-500/80 rounded-xl text-white outline-none transition-all duration-200 focus:shadow-[0_0_15px_rgba(6,180,212,0.15)]"
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white py-2.5 rounded-xl font-mono text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-2.5 rounded-xl font-mono text-sm tracking-wide transition-all duration-300 shadow-[0_0_15px_rgba(6,180,212,0.3)] transform active:scale-95"
                >
                  {loading ? 'Decrypting...' : 'Verify OTP'}
                </button>
              </div>

              <div className="text-center mt-4 font-mono text-xs">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Request Code Retransmission
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Final Form (Register or Reset Password) */}
          {step === 3 && (
            <form onSubmit={handleSubmitFinal} className="space-y-5">
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono flex items-center justify-between mb-4">
                <span>Node Email: <strong>{email}</strong></span>
                <span className="font-bold tracking-widest text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">PASSED</span>
              </div>

              {userExists ? (
                /* PASSWORD RESET FLOW FOR EXISTING USERS */
                <div className="space-y-5">
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-mono leading-relaxed">
                    Identity collision detected. Expose a new passphrase to reset access keys.
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
                      New Passphrase
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl text-white outline-none transition-all duration-300 font-mono text-sm focus:shadow-[0_0_15px_rgba(6,180,212,0.15)] placeholder-slate-600"
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
                      Confirm New Passphrase
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl text-white outline-none transition-all duration-300 font-mono text-sm focus:shadow-[0_0_15px_rgba(6,180,212,0.15)] placeholder-slate-600"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 px-4 rounded-xl font-mono text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_0_15px_rgba(6,180,212,0.3)] transform active:scale-95"
                  >
                    {loading ? 'Updating Keys...' : 'Reset Passphrase & Connect'}
                  </button>
                </div>
              ) : (
                /* REGISTRATION FLOW FOR NEW USERS */
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
                      Grid Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl text-white outline-none transition-all duration-300 font-mono text-sm focus:shadow-[0_0_15px_rgba(6,180,212,0.15)] placeholder-slate-600"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNo" className="block text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
                      Contact Phone No
                    </label>
                    <input
                      id="phoneNo"
                      name="phoneNo"
                      type="tel"
                      required
                      value={formData.phoneNo}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl text-white outline-none transition-all duration-300 font-mono text-sm focus:shadow-[0_0_15px_rgba(6,180,212,0.15)] placeholder-slate-600"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-3">
                      Core Operations Role
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-300 select-none ${
                          formData.role === 'TAKER'
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,180,212,0.15)]'
                            : 'border-slate-850 bg-slate-950/40 text-slate-400 hover:border-slate-700'
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
                        <div className="text-center font-mono">
                          <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="font-bold text-sm uppercase tracking-wider block">Rent Bikes</span>
                          <p className="text-[10px] text-slate-500 mt-1">Book vehicles</p>
                        </div>
                      </label>
                      <label
                        className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-300 select-none ${
                          formData.role === 'BIKER'
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,180,212,0.15)]'
                            : 'border-slate-850 bg-slate-950/40 text-slate-400 hover:border-slate-700'
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
                        <div className="text-center font-mono">
                          <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-sm uppercase tracking-wider block">List Bikes</span>
                          <p className="text-[10px] text-slate-500 mt-1">Host node</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
                      Core Passphrase
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl text-white outline-none transition-all duration-300 font-mono text-sm focus:shadow-[0_0_15px_rgba(6,180,212,0.15)] placeholder-slate-600"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
                      Confirm Passphrase
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl text-white outline-none transition-all duration-300 font-mono text-sm focus:shadow-[0_0_15px_rgba(6,180,212,0.15)] placeholder-slate-600"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 px-4 rounded-xl font-mono text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_0_15px_rgba(6,180,212,0.3)] transform active:scale-95"
                  >
                    {loading ? 'Compiling Node Details...' : 'Complete Initialization'}
                  </button>
                </div>
              )}
            </form>
          )}

          <div className="mt-6 text-center font-mono text-xs">
            <span className="text-slate-500">Established Connection? </span>
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
              Session Sign-In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

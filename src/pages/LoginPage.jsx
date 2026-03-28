import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, CheckCircle,
  Mail, User, KeyRound, Lock, Eye, EyeOff, ArrowLeft,
} from 'lucide-react';

/* ── Forgot Password Flow ────────────────────────────────────── */
function ForgotPassword({ onBack }) {
  const [method,          setMethod]          = useState(null); // 'username' | 'email'
  const [step,            setStep]            = useState(1);    // 1=input, 2=otp+newpass, 3=success
  const [inputVal,        setInputVal]        = useState('');
  const [otpInput,        setOtpInput]        = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [err,             setErr]             = useState('');

  const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-300";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-tight";

  // Step 1 — send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) { setErr(`Please enter your ${method === 'username' ? 'username' : 'email'}.`); return; }
    setLoading(true); setErr('');
    try {
      if (method === 'username') await authAPI.forgotByUsername(inputVal.trim());
      else                       await authAPI.forgotByEmail(inputVal.trim());
      setStep(2);
    } catch (err) {
      const d = err.response?.data;
      setErr(typeof d === 'string' ? d : d?.message || 'Could not send OTP. Please check your input.');
    } finally { setLoading(false); }
  };

  // Step 2 — OTP + new password together
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!otpInput.trim())                { setErr('Please enter the OTP.'); return; }
    if (newPassword.length < 6)          { setErr('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword)  { setErr('Passwords do not match.'); return; }
    setLoading(true); setErr('');
    try {
      if( method === 'username'){
        await authAPI.resetPasswordByUsername({
        username: inputVal.trim(),
        otp:      otpInput.trim(),
        password: newPassword,
      });
      }else{
        await authAPI.resetPasswordByEmail({
        email:    inputVal.trim(),
        otp:      otpInput.trim(),
        password: newPassword,
      });

      }
      setStep(3);
    } catch (err) {
      const d = err.response?.data;
      setErr(typeof d === 'string' ? d : d?.message || 'Failed to reset password. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setOtpInput(''); setErr(''); setLoading(true);
    try {
      if (method === 'username') await authAPI.forgotByUsername(inputVal.trim());
      else                       await authAPI.forgotByEmail(inputVal.trim());
    } catch (err) {
      const d = err.response?.data;
      setErr(typeof d === 'string' ? d : d?.message || 'Failed to resend OTP.');
    } finally { setLoading(false); }
  };

  // ── Method selection ──
  if (!method) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 font-semibold transition-colors mb-2">
          <ArrowLeft size={15} /> Back to Sign In
        </button>
        <div className="text-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
            <Lock size={24} className="text-teal-600" />
          </div>
          <h4 className="text-xl font-bold text-slate-800">Forgot Password?</h4>
          <p className="text-sm text-slate-500 mt-1">Choose how you'd like to reset your password.</p>
        </div>
        <button onClick={() => setMethod('username')}
          className="w-full flex items-center gap-4 p-4 bg-white border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 rounded-2xl transition-all text-left group">
          <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
            <User size={20} className="text-teal-600" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">By Username</p>
            <p className="text-xs text-slate-500">Enter your username, we'll send OTP to your email</p>
          </div>
        </button>
        <button onClick={() => setMethod('email')}
          className="w-full flex items-center gap-4 p-4 bg-white border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 rounded-2xl transition-all text-left group">
          <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
            <Mail size={20} className="text-teal-600" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">By Email</p>
            <p className="text-xs text-slate-500">Enter your email address, we'll send OTP to it</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with back */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => {
            if (step === 1) { setMethod(null); setInputVal(''); setErr(''); }
            else if (step === 2) { setStep(1); setOtpInput(''); setNewPassword(''); setConfirmPassword(''); setErr(''); }
            else { onBack(); }
          }}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0">
          <ArrowLeft size={17} />
        </button>
        <div>
          <h4 className="text-lg font-bold text-slate-800">
            {step === 3 ? 'Password Reset!' : step === 2 ? 'Verify & Reset' : method === 'username' ? 'Enter Username' : 'Enter Email'}
          </h4>
          <p className="text-xs text-slate-400">{method === 'username' ? 'Via username' : 'Via email'}</p>
        </div>
      </div>

      {/* Step indicator — 2 steps now */}
      {step < 3 && (
        <div className="flex items-center gap-2">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</div>
              {s < 2 && <div className={`flex-1 h-1 rounded-full transition-all ${step > s ? 'bg-teal-600' : 'bg-slate-100'}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Error */}
      {err && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle size={15} className="flex-shrink-0" />{err}
        </div>
      )}

      {/* Step 1 — username or email */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <p className="text-sm text-slate-500">
            {method === 'username'
              ? 'Enter your username. We will send an OTP to your registered email.'
              : 'Enter your registered email. We will send an OTP to it.'}
          </p>
          <div>
            <label className={labelCls}>{method === 'username' ? 'Username' : 'Email Address'}</label>
            <div className="relative">
              {method === 'username'
                ? <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                : <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
              <input className={inputCls + " pl-10"}
                type={method === 'email' ? 'email' : 'text'}
                value={inputVal} onChange={e => setInputVal(e.target.value)}
                placeholder={method === 'username' ? 'Your username' : 'your@email.com'}
                required autoFocus />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-3 text-base transition-all shadow-lg shadow-teal-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" />Sending OTP…</> : 'Send OTP'}
          </button>
        </form>
      )}

      {/* Step 2 — OTP + new password (merged) */}
      {step === 2 && (
        <form onSubmit={handleVerifyAndReset} className="space-y-4">
          <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-center gap-2">
            <Mail size={15} className="text-teal-600 flex-shrink-0" />
            <p className="text-sm text-teal-700">
              OTP sent to your {method === 'username' ? 'registered email' : <span className="font-bold">{inputVal}</span>}
            </p>
          </div>

          {/* OTP */}
          <div>
            <label className={labelCls}>Enter OTP</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input className={inputCls + " pl-10 text-center tracking-[0.4em] text-xl font-bold"}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="• • • • • •"
                required autoFocus />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-1" />

          {/* New password */}
          <div>
            <label className={labelCls}>New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input className={inputCls + " pl-10 pr-11"}
                type={showNew ? 'text' : 'password'}
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters" required />
              <button type="button" onClick={() => setShowNew(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className={labelCls}>Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input className={inputCls + " pl-10 pr-11"}
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password" required />
              <button type="button" onClick={() => setShowConfirm(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500 mt-1.5 ml-1">Passwords do not match.</p>}
            {confirmPassword && newPassword === confirmPassword && <p className="text-xs text-teal-600 mt-1.5 ml-1 flex items-center gap-1"><CheckCircle size={11} />Passwords match.</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-3 text-base transition-all shadow-lg shadow-teal-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" />Resetting…</> : 'Reset Password'}
          </button>

          <button type="button" onClick={handleResendOtp} disabled={loading}
            className="w-full text-sm text-teal-600 hover:text-teal-700 font-semibold py-1 disabled:opacity-50">
            {loading ? 'Resending…' : 'Resend OTP'}
          </button>
        </form>
      )}

      {/* Step 3 — success */}
      {step === 3 && (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-teal-600" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">Password Reset!</h4>
          <p className="text-sm text-slate-500 mb-6">Your password has been reset successfully. Sign in with your new password.</p>
          <button onClick={onBack}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-3 text-base transition-all shadow-lg shadow-teal-200">
            Go to Sign In
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Login Page ──────────────────────────────────────────────── */
export default function LoginPage({ onGoRegister }) {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,         setForm]         = useState({ username: '', password: '' });
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showForgot,   setShowForgot]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(''); setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, {
        fullName:  res.data.fullName,
        email:     res.data.email,
        role:      res.data.role, 
        storeName: res.data.storeName,
        gstNumber: res.data.gstNumber,
      });
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.message || 'Invalid username or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white relative overflow-hidden px-4 py-8 sm:py-12">
      <div className="fixed -top-20 -right-20 w-48 h-48 md:w-72 md:h-72 bg-teal-600/[0.07] rounded-full pointer-events-none" />
      <div className="fixed -bottom-16 -left-16 w-40 h-40 md:w-60 md:h-60 bg-teal-600/[0.05] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 md:p-10 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {showForgot ? (
          <ForgotPassword onBack={() => { setShowForgot(false); setError(''); }} />
        ) : (
          <>
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-block p-1 bg-white rounded-full shadow-sm mb-3 sm:mb-4 border border-slate-100">
                <img src="/logo.png" alt="IMS" className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Welcome back</h4>
              <p className="text-sm md:text-base text-slate-500">Sign in to Inventory Management System</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-800 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5 sm:mb-6 shadow-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-tight">Username</label>
                <input type="text" name="username"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-300"
                  value={form.username} onChange={handleChange}
                  placeholder="Enter your username" required autoFocus />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-tight">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 pr-12 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-300"
                    value={form.password} onChange={handleChange}
                    placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button type="button" onClick={() => setShowForgot(true)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline underline-offset-4 transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-3 sm:py-4 text-base sm:text-lg transition-all shadow-lg shadow-teal-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center mt-2">
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span>
                  : 'Sign In'}
              </button>
            </form>

            <p className="text-center mt-6 sm:mt-8 text-sm text-slate-500">
              Don't have an account?{' '}
              <button type="button" onClick={onGoRegister || (() => navigate('/register'))}
                className="text-teal-600 font-bold hover:text-teal-700 transition-colors underline-offset-4 hover:underline">
                Sign Up
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../hooks/useApi';
import {
  X, Loader2, CheckCircle, AlertCircle,
  User, Store, Mail, KeyRound, Pencil,
  Lock, Eye, EyeOff, ChevronDown,
} from 'lucide-react';

/* ── Update Profile Modal ────────────────────────────────────── */
function UpdateProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const [step,      setStep]      = useState(1);
  const [fullName,  setFullName]  = useState(user?.fullName  || '');
  const [storeName, setStoreName] = useState(user?.storeName || '');
  const [otpInput,  setOtpInput]  = useState('');
  const [sending,   setSending]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState('');

  const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-tight";

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!fullName.trim())  { setErr('Full name is required.'); return; }
    if (!storeName.trim()) { setErr('Store name is required.'); return; }
    setSending(true); setErr('');
    try {
      await authAPI.sendOtp();
      setStep(2);
    } catch (err) {
      const d = err.response?.data;
      setErr(typeof d === 'string' ? d : d?.message || 'Failed to send OTP.');
    } finally { setSending(false); }
  };

  const handleVerifyAndUpdate = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) { setErr('Please enter the OTP.'); return; }
    setSaving(true); setErr('');
    try {
      await authAPI.updateProfile({ fullName: fullName.trim(), storeName: storeName.trim(), otp: otpInput.trim() });
      updateUser({ fullName: fullName.trim(), storeName: storeName.trim() });
      setStep(3);
    } catch (err) {
      const d = err.response?.data;
      setErr(typeof d === 'string' ? d : d?.message || 'Invalid OTP or update failed.');
    } finally { setSaving(false); }
  };

  const handleResendOtp = async () => {
    setOtpInput(''); setErr(''); setSending(true);
    try { await authAPI.sendOtp(); }
    catch (err) { const d = err.response?.data; setErr(typeof d === 'string' ? d : d?.message || 'Failed to resend OTP.'); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
              <User size={15} className="text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {step === 1 ? 'Update Profile' : step === 2 ? 'Verify OTP' : 'Profile Updated'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <div className="p-6">
          {step < 3 && (
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</div>
                  {s < 2 && <div className={`flex-1 h-1 rounded-full transition-all ${step > s ? 'bg-teal-600' : 'bg-slate-100'}`} />}
                </React.Fragment>
              ))}
            </div>
          )}
          {err && <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium mb-4"><AlertCircle size={15} className="flex-shrink-0" />{err}</div>}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-sm text-slate-500">Update your full name and store name. An OTP will be sent to <span className="font-semibold text-slate-700">{user?.email}</span>.</p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <div><p className="text-xs text-slate-400">Email (cannot change)</p><p className="text-sm font-semibold text-slate-700">{user?.email}</p></div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Full Name</label>
                <div className="relative"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /><input className={inputCls + " pl-10"} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required /></div>
              </div>
              <div>
                <label className={labelCls}>Store Name</label>
                <div className="relative"><Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /><input className={inputCls + " pl-10"} value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Your store name" required /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={sending} className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-base font-semibold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {sending ? <><Loader2 size={16} className="animate-spin" />Sending…</> : 'Send OTP'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAndUpdate} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-3"><Mail size={24} className="text-teal-600" /></div>
                <p className="text-sm text-slate-600">OTP sent to <span className="font-bold text-slate-800">{user?.email}</span></p>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1">Changes to apply</p>
                <div className="flex items-center gap-2 text-sm"><User size={13} className="text-teal-500" /><span className="text-slate-500">Name:</span><span className="font-semibold text-slate-800">{fullName}</span></div>
                <div className="flex items-center gap-2 text-sm"><Store size={13} className="text-teal-500" /><span className="text-slate-500">Store:</span><span className="font-semibold text-slate-800">{storeName}</span></div>
              </div>
              <div>
                <label className={labelCls}>Enter OTP</label>
                <div className="relative"><KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /><input className={inputCls + " pl-10 text-center tracking-[0.5em] text-xl font-bold"} value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="• • • • • •" required autoFocus /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setStep(1); setErr(''); setOtpInput(''); }} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Back</button>
                <button type="submit" disabled={saving || !otpInput} className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-base font-semibold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" />Updating…</> : 'Confirm Update'}
                </button>
              </div>
              <button type="button" onClick={handleResendOtp} disabled={sending} className="w-full text-sm text-teal-600 hover:text-teal-700 font-semibold py-1 disabled:opacity-50">{sending ? 'Resending…' : 'Resend OTP'}</button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-teal-600" /></div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">Profile Updated!</h4>
              <p className="text-sm text-slate-500 mb-6">Your name and store name have been updated successfully.</p>
              <button onClick={onClose} className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-base font-semibold text-white transition-colors">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Update Password Modal — 2 steps ────────────────────────── */
function UpdatePasswordModal({ onClose }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  // Step 1: username + current password → sends OTP
  // Step 2: OTP + new password + confirm password → updates
  const [step,            setStep]            = useState(1);
  const [username,        setUsername]        = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [otpInput,        setOtpInput]        = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [sending,         setSending]         = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [err,             setErr]             = useState('');

  const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-tight";

  // Step 1 → POST /verifypasswordforotp { username, password } → OTP sent
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!username.trim())        { setErr('Username is required.'); return; }
    if (!currentPassword.trim()) { setErr('Current password is required.'); return; }
    setSending(true); setErr('');
    try {
      await authAPI.verifyPasswordOtp({ username: username.trim(), password: currentPassword.trim() });
      setStep(2);
    } catch (err) {
      const d = err.response?.data;
      setErr(typeof d === 'string' ? d : d?.message || 'Invalid username or password.');
    } finally { setSending(false); }
  };

  // Step 2 → POST /updatepassword { otp, username, password, newPassword }
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!otpInput.trim())               { setErr('Please enter the OTP.'); return; }
    if (newPassword.length < 6)         { setErr('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setErr('Passwords do not match.'); return; }
    setSaving(true); setErr('');
    try {
      await authAPI.updatePassword({
        otp:         otpInput.trim(),
        username:    username.trim(),
        password:    currentPassword.trim(),
        newPassword: newPassword,
      });
      setStep(3);
    } catch (err) {
      const d = err.response?.data;
      setErr(typeof d === 'string' ? d : d?.message || 'Failed to update password.');
    } finally { setSaving(false); }
  };

  const handleResendOtp = async () => {
    setOtpInput(''); setErr(''); setSending(true);
    try { await authAPI.verifyPasswordOtp({ username: username.trim(), password: currentPassword.trim() }); }
    catch (err) { const d = err.response?.data; setErr(typeof d === 'string' ? d : d?.message || 'Failed to resend OTP.'); }
    finally { setSending(false); }
  };

  // Auto logout after success
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, logout]);

  const stepLabels = ['Verify Identity', 'OTP & New Password'];

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
              <Lock size={15} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {step === 3 ? 'Password Updated' : stepLabels[step - 1]}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        <div className="p-6">
          {/* Step indicator — 2 steps */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</div>
                  {s < 2 && <div className={`flex-1 h-1 rounded-full transition-all ${step > s ? 'bg-purple-600' : 'bg-slate-100'}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {err && <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium mb-4"><AlertCircle size={15} className="flex-shrink-0" />{err}</div>}

          {/* ── Step 1: Username + current password ── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-sm text-slate-500">Enter your username and current password. An OTP will be sent to your registered email.</p>
              <div>
                <label className={labelCls}>Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input className={inputCls + " pl-10"} value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" required autoFocus />
                </div>
              </div>
              <div>
                <label className={labelCls}>Current Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input className={inputCls + " pl-10 pr-11"} type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Your current password" required />
                  <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={sending} className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-base font-semibold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {sending ? <><Loader2 size={16} className="animate-spin" />Sending…</> : 'Send OTP'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: OTP + new password + confirm — all in one form ── */}
          {step === 2 && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-center gap-2">
                <Mail size={15} className="text-purple-500 flex-shrink-0" />
                <p className="text-sm text-purple-700">OTP sent to your registered email</p>
              </div>

              {/* OTP */}
              <div>
                <label className={labelCls}>Enter OTP</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input className={inputCls + " pl-10 text-center tracking-[0.5em] text-xl font-bold"}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="• • • • • •" required autoFocus />
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* New password */}
              <div>
                <label className={labelCls}>New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input className={inputCls + " pl-10 pr-11"} type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" required />
                  <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className={labelCls}>Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input className={inputCls + " pl-10 pr-11"} type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500 mt-1.5 ml-1">Passwords do not match.</p>}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && <p className="text-xs text-teal-600 mt-1.5 ml-1 flex items-center gap-1"><CheckCircle size={11} />Passwords match.</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setStep(1); setErr(''); setOtpInput(''); setNewPassword(''); setConfirmPassword(''); }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Back</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-base font-semibold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" />Updating…</> : 'Update Password'}
                </button>
              </div>
              <button type="button" onClick={handleResendOtp} disabled={sending}
                className="w-full text-sm text-purple-600 hover:text-purple-700 font-semibold py-1 disabled:opacity-50">
                {sending ? 'Resending…' : 'Resend OTP'}
              </button>
            </form>
          )}

          {/* ── Step 3: Success — auto redirects ── */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-purple-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">Password Updated!</h4>
              <p className="text-sm text-slate-500 mb-4">Your password has been changed successfully.</p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                Redirecting to login…
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Navbar ──────────────────────────────────────────────────── */
export default function Navbar() {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const openModal = (type) => {
    setMenuOpen(false);
    if (type === 'profile')  setShowProfile(true);
    if (type === 'password') setShowPassword(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 md:h-20 bg-white border-b border-teal-100 shadow-sm flex items-center justify-between px-4 md:px-16">

        <div className="w-10 flex-shrink-0 md:hidden" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 no-underline group">
          <div className="w-9 h-9 md:w-14 md:h-14 rounded-full border-2 border-teal-100 p-0.5 flex items-center justify-center transition-transform group-hover:scale-105 bg-white">
            <img src="/logo.png" alt="IMS" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="text-sm md:text-[18px] font-bold text-teal-900 tracking-tight">IMS</div>
            <div className="text-[9px] md:text-[12px] text-teal-500 tracking-wider font-semibold uppercase">Inventory Management</div>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {user ? (
            <>
              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-teal-600 border-2 border-teal-100 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block leading-tight text-left">
                    <div className="text-[13px] font-bold text-teal-900 max-w-[120px] truncate">{user.fullName}</div>
                    <div className="text-[11px] text-teal-400 font-medium max-w-[120px] truncate">{user.storeName}</div>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform hidden md:block ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setMenuOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 shadow-2xl rounded-2xl z-[60] overflow-hidden">

                      {/* User info */}
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                        <div className="w-11 h-11 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          <p className="text-xs text-teal-600 font-semibold truncate">{user.storeName}</p>
                        </div>
                      </div>

                      {/* GST — owner only */}
                      {isOwner && (
                        <div className="px-5 py-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide w-16 flex-shrink-0">GST</span>
                            <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100 truncate">{user.gstNumber || '—'}</span>
                          </div>
                        </div>
                      )}

                      {/* Actions — owner only */}
                      {isOwner && (
                        <div className="px-3 py-2">
                          <button onClick={() => openModal('profile')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-teal-50 text-sm font-semibold text-slate-700 hover:text-teal-700 transition-colors text-left">
                            <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0"><Pencil size={13} className="text-teal-600" /></div>
                            Update Profile
                          </button>
                          <button onClick={() => openModal('password')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-sm font-semibold text-slate-700 hover:text-purple-700 transition-colors text-left">
                            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0"><Lock size={13} className="text-purple-600" /></div>
                            Update Password
                          </button>
                        </div>
                      )}

                    </div>
                  </>
                )}
              </div>

              {/* Logout — outside dropdown */}
              <button
                onClick={handleLogout}
                className="text-[11px] md:text-[13px] font-bold text-teal-600 border-2 border-teal-600 rounded-xl px-2.5 py-1 md:px-5 md:py-2 hover:bg-teal-600 hover:text-white active:scale-95 transition-all shadow-sm">
                <span className="hidden sm:inline">Log out</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-2">
              <Link to="/login"    className="text-[11px] md:text-[13px] font-bold text-white bg-teal-600 border border-teal-600 rounded-xl px-3 py-1.5 md:px-6 md:py-2.5 hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-95 no-underline">Login</Link>
              <Link to="/register" className="text-[11px] md:text-[13px] font-bold text-white bg-teal-600 border border-teal-600 rounded-xl px-3 py-1.5 md:px-6 md:py-2.5 hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-95 no-underline">Sign up</Link>
            </div>
          )}
        </div>
      </nav>

      {showProfile  && <UpdateProfileModal  onClose={() => setShowProfile(false)} />}
      {showPassword && <UpdatePasswordModal onClose={() => setShowPassword(false)} />}
    </>
  );
}
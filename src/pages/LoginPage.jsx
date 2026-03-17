import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onGoRegister }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, {
        fullName: res.data.fullName,
        email: res.data.email,
        storeName: res.data.storeName,
        gstNumber: res.data.gstNumber,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white relative overflow-hidden px-4">
      {/* Background Blobs */}
      <div className="fixed -top-20 -right-20 w-48 h-48 md:w-72 md:h-72 bg-teal-600/[0.07] rounded-full pointer-events-none" />
      <div className="fixed -bottom-16 -left-16 w-40 h-40 md:w-60 md:h-60 bg-teal-600/[0.05] rounded-full pointer-events-none" />

      {/* Main Login Card - Updated to bg-slate-50 */}
      <div className="w-full max-w-[420px] bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-10 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-1 bg-white rounded-full shadow-sm mb-4 border border-slate-100">
            <img src="/logo.png" alt="IMS" className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover" />
          </div>
          <h4 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h4>
          <p className="text-sm md:text-base text-slate-500">Sign in to Inventory Management System</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-800 border border-red-200 rounded-xl px-4 py-3 text-sm mb-6 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-tight">Username</label>
            <input
              type="text"
              name="username"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-300"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-tight">Password</label>
            <input
              type="password"
              name="password"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-300"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-4 text-lg transition-all shadow-lg shadow-teal-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-slate-500">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={onGoRegister || (() => navigate('/register'))} 
            className="text-teal-600 font-bold hover:text-teal-700 transition-colors underline-offset-4 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
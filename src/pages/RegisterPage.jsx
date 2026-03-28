import React, { useState } from "react";
import { authAPI } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";

export default function RegisterPage({ onGoLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", fullName: "", email: "",
    storeName: "", gstNumber: "", password: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters long.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    
    const { confirmPassword, ...payload } = form;
    setLoading(true);
    try {
      const res = await authAPI.register(payload);
      setMessage("Account created successfully!");
      setTimeout(() => { 
        onGoLogin ? onGoLogin() : navigate("/login"); 
      }, 2000);
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-300";
  const labelClass = "block text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-tight";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white relative overflow-hidden px-4 py-10">
     
      <div className="fixed -top-20 -right-20 w-48 h-48 md:w-72 md:h-72 bg-teal-600/[0.07] rounded-full pointer-events-none" />
      <div className="fixed -bottom-16 -left-16 w-40 h-40 md:w-60 md:h-60 bg-teal-600/[0.05] rounded-full pointer-events-none" />

      <div className="w-full max-w-[550px] bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-10 z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-1 bg-white rounded-full shadow-sm mb-4 border border-slate-100">
            <img src="/logo.png" alt="IMS" className="w-16 h-16 rounded-full mx-auto" />
          </div>
          <h4 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h4>
          <p className="text-sm text-slate-500">Join Inventory Management System</p>
        </div>

        {message && <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-4 py-3 text-sm mb-6 animate-pulse shadow-sm font-medium">{message}</div>}
        {error && <div className="bg-red-50 text-red-800 border border-red-200 rounded-xl px-4 py-3 text-sm mb-6 shadow-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Username</label>
              <input type="text" className={inputClass} name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
            </div>
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" className={inputClass} name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" className={inputClass} name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Store Name</label>
              <input type="text" className={inputClass} name="storeName" value={form.storeName} onChange={handleChange} placeholder="My Store" required />
            </div>
            <div>
              <label className={labelClass}>GST Number</label>
              <input type="text" className={inputClass} name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="15-digit GSTIN" maxLength={15} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" className={inputClass} name="password" value={form.password} onChange={handleChange} placeholder="Min 6 chars" required />
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input type="password" className={inputClass} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter" required />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-4 text-lg transition-all shadow-lg shadow-teal-200 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onGoLogin || (() => navigate("/login"))}
            className="text-teal-600 font-bold hover:text-teal-700 hover:underline underline-offset-4"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
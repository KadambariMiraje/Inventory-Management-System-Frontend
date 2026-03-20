import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productAPI } from '../../hooks/useApi';
import { PackagePlus, ShoppingCart, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

const EMPTY_FORM = {
  productCode:   '',
  productName:   '',
  category:      '',
  minStockLevel: '',
  
};

const DEFAULT_CATEGORIES = [
  'Medicine', 'Food', 'Electronics',
  'Clothing', 'Stationery', 'Grocery',
];

export default function AddProduct() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]           = useState(EMPTY_FORM);
  const [msg, setMsg]             = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [isCustom, setIsCustom]       = useState(false);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    if (!loading && (!user || !token)) navigate('/login');
  }, [user, token, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // When dropdown changes
  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustom(true);
      setForm({ ...form, category: '' });
      setCustomInput('');
    } else {
      setIsCustom(false);
      setForm({ ...form, category: val });
    }
  };

  // While typing custom category
  const handleCustomInput = (e) => {
    setCustomInput(e.target.value);
    setForm({ ...form, category: e.target.value });
  };

  // Cancel custom — go back to dropdown
  const cancelCustom = () => {
    setIsCustom(false);
    setCustomInput('');
    setForm({ ...form, category: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      const payload = {
        productCode:   form.productCode.trim(),
        productName:   form.productName.trim(),
        category:      form.category.trim(),
        minStockLevel: parseInt(form.minStockLevel),
        
      };
      const res = await productAPI.addProduct(payload);
      setMsg({ type: 'success', text: res.data });
      setForm(EMPTY_FORM);
      setIsCustom(false);
      setCustomInput('');
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data || 'Failed to add product. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed";
  const labelCls = "block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-tight";

  return (
    <div className="max-w-2xl mx-auto">

      {/* Heading */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200">
          <PackagePlus size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">Add New Product</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Fill in the details to register a product</p>
        </div>
      </div>

      {/* Alert */}
      {msg && (
        <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 mb-6 text-sm font-medium shadow-sm ${
          msg.type === 'success'
            ? 'bg-teal-50 text-teal-800 border border-teal-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {msg.type === 'success'
            ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5 text-teal-600" />
            : <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
          }
          <span>{msg.text}</span>
        </div>
      )}

      {/* Form card */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

          {/* Row 1 — Code + Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Product Code </label>
              <input
                type="text" name="productCode" className={inputCls}
                value={form.productCode} onChange={handleChange}
                placeholder="e.g. PROD-001" required disabled={submitting}
              />
            </div>
            <div>
              <label className={labelCls}>Product Name </label>
              <input
                type="text" name="productName" className={inputCls}
                value={form.productName} onChange={handleChange}
                placeholder="e.g. Paracetamol 500mg" required disabled={submitting}
              />
            </div>
          </div>

          {/* Row 2 — Category */}
          <div>
            <label className={labelCls}>Category </label>

            {!isCustom ? (
              /* Normal dropdown */
              <select
                className={inputCls}
                value={form.category}
                onChange={handleCategorySelect}
                required
                disabled={submitting}
              >
                <option value="">Select a category…</option>
                {DEFAULT_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">+ Add custom category…</option>
              </select>
            ) : (
              /* Custom text input */
              <div className="flex gap-2">
                <input
                  type="text"
                  className={inputCls}
                  value={customInput}
                  onChange={handleCustomInput}
                  placeholder="Type your custom category…"
                  required
                  autoFocus
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={cancelCustom}
                  className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-300 transition-all"
                  title="Back to dropdown"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
          {/* Row 3 — Min Stock + Interest Rate */}
          <div className="grid gap-4">
            <div>
              <label className={labelCls}>Min Stock Level </label>
              <input
                type="number" name="minStockLevel" className={inputCls}
                value={form.minStockLevel} onChange={handleChange}
                placeholder="e.g. 10" min="0" required disabled={submitting}
              />
            </div>
            
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-3 sm:py-3.5 text-sm sm:text-base transition-all shadow-lg shadow-teal-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" />Adding…</>
              ) : (
                <><PackagePlus size={18} />Add Product</>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard/purchase')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-teal-600 font-bold border-2 border-teal-600 rounded-xl py-3 sm:py-3.5 px-5 text-sm sm:text-base transition-all active:scale-[0.98]"
            >
              <ShoppingCart size={18} />
              Go to Purchase
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
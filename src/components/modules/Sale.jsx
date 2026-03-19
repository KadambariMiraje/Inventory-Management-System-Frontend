import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productAPI, transactionAPI } from '../../hooks/useApi';
import {
  ShoppingCart, CheckCircle, AlertCircle,
  Loader2, ChevronDown,
} from 'lucide-react';

const EMPTY_FORM = {
  quantity:     '',
  customerName: '',
  interestRate:  '',
};

export default function Sale() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories]     = useState([]);
  const [products, setProducts]         = useState([]);   // List<String>
  const [selectedCat, setSelectedCat]   = useState('');
  const [selectedProd, setSelectedProd] = useState('');   // product name string

  const [form, setForm]         = useState(EMPTY_FORM);
  const [loadingCats, setLoadingCats]   = useState(false);
  const [loadingProds, setLoadingProds] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [msg, setMsg]                   = useState(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !token)) navigate('/login');
  }, [user, token, authLoading, navigate]);

  // Fetch categories — GET /getcategory (same as purchase)
  useEffect(() => {
    if (authLoading || !token) return;
    setLoadingCats(true);
    productAPI.getCategories()
      .then(res => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, [authLoading, token]);

  // Fetch product names when category changes — POST /getproductname/{categoryname}
  useEffect(() => {
    if (!selectedCat) { setProducts([]); setSelectedProd(''); return; }
    setLoadingProds(true);
    setSelectedProd('');
    productAPI.getByCategory(selectedCat)
      .then(res => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProds(false));
  }, [selectedCat]);

  if (authLoading) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!selectedCat)  { setMsg({ type: 'error', text: 'Please select a category.' });  return; }
    if (!selectedProd) { setMsg({ type: 'error', text: 'Please select a product.' });   return; }

    setSubmitting(true);
    try {
      const payload = {
        category : selectedCat,
        productName:  selectedProd,
        quantity:     parseInt(form.quantity),
        interestRate:  parseFloat(form.interestRate),
        customerName: form.customerName.trim(),
      };
      // TODO: update endpoint path when backend endpoints are shared
      const res = await transactionAPI.sale(payload);
      setMsg({ type: 'success', text: res.data || 'Sale recorded successfully!' });
      setForm(EMPTY_FORM);
      setSelectedProd('');
      setSelectedCat('');
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data || 'Sale failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls  = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed";
  const labelCls  = "block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-tight";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  return (
    <div className="max-w-2xl mx-auto">

      {/* Heading */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200">
          <ShoppingCart size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">Record Sale</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Sell a product and update inventory</p>
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

      <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Step 1 — Select Product */}
          <div>
            

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Category */}
              <div>
                <label className={labelCls}>Category </label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={selectedCat}
                    onChange={e => setSelectedCat(e.target.value)}
                    required
                    disabled={submitting || loadingCats}
                  >
                    <option value="">
                      {loadingCats ? 'Loading…' : 'Select category…'}
                    </option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className={labelCls}>Product Name </label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={selectedProd}
                    onChange={e => setSelectedProd(e.target.value)}
                    required
                    disabled={submitting || !selectedCat || loadingProds}
                  >
                    <option value="">
                      {!selectedCat
                        ? 'Select category first…'
                        : loadingProds
                          ? 'Loading…'
                          : products.length === 0
                            ? 'No products found'
                            : 'Select product…'}
                    </option>
                    {products.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  {loadingProds && (
                    <Loader2 size={14} className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin text-teal-500" />
                  )}
                </div>
              </div>

            </div>
          </div>

         

          {/* Step 2 — Sale Details */}
          <div>
            

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Quantity </label>
                <input
                  type="number" name="quantity" className={inputCls}
                  value={form.quantity} onChange={handleChange}
                  placeholder="e.g. 10" min="1"
                  required disabled={submitting}
                />
              </div>
              <div>
              <label className={labelCls}>Interest Rate (%) *</label>
              <input
                type="number" name="interestRate" className={inputCls}
                value={form.interestRate} onChange={handleChange}
                placeholder="e.g. 5.5" step="0.01" min="0" required disabled={submitting}
              />
            </div>
             
            </div>
          </div>

           <div>
                <label className={labelCls}>Customer Name</label>
                <input
                  type="text" name="customerName" className={inputCls}
                  value={form.customerName} onChange={handleChange}
                  placeholder="e.g. Raj Medical"
                  disabled={submitting}
                />
              </div>

          {/* Submit */}
          <button
            type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-3 sm:py-3.5 text-sm sm:text-base transition-all shadow-lg shadow-teal-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting
              ? <><Loader2 size={18} className="animate-spin" />Processing…</>
              : <><ShoppingCart size={18} />Record Sale</>
            }
          </button>

        </form>
      </div>
    </div>
  );
}
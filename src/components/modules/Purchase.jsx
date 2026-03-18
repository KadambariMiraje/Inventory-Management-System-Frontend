import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productAPI, batchAPI } from '../../hooks/useApi';
import {
  ShoppingBag, CheckCircle, AlertCircle,
  Loader2, ChevronDown, Calendar,
} from 'lucide-react';

const EMPTY_FORM = {
  batchNo:       '',
  currQuantity:  '',
  purchasePrice: '',
  partyName:     '',
  expiryDate:    '',
};

export default function Purchase() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories]     = useState([]);
  const [products, setProducts]         = useState([]);   // list of strings
  const [selectedCat, setSelectedCat]   = useState('');
  const [selectedProd, setSelectedProd] = useState('');   // product name string

  const [form, setForm]           = useState(EMPTY_FORM);
  const [hasExpiry, setHasExpiry] = useState(false);

  const [loadingCats, setLoadingCats]   = useState(false);
  const [loadingProds, setLoadingProds] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [msg, setMsg]                   = useState(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !token)) navigate('/login');
  }, [user, token, authLoading, navigate]);

  // Fetch categories — GET /getcategory
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

  // Clear expiry date when checkbox unchecked
  useEffect(() => {
    if (!hasExpiry) setForm(f => ({ ...f, expiryDate: '' }));
  }, [hasExpiry]);

  if (authLoading) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!selectedCat)              { setMsg({ type: 'error', text: 'Please select a category.' });   return; }
    if (!selectedProd)             { setMsg({ type: 'error', text: 'Please select a product.' });    return; }
    if (hasExpiry && !form.expiryDate) { setMsg({ type: 'error', text: 'Please enter the expiry date.' }); return; }

    setSubmitting(true);
    try {
      const payload = {
        category : selectedProd,
        productName:   selectedProd,
        batchNo:       form.batchNo.trim(),
        currQuantity:  parseInt(form.currQuantity),
        purchasePrice: parseFloat(form.purchasePrice),
        partyName:     form.partyName.trim(),
        expiryDate:    hasExpiry ? form.expiryDate : null,
      };
      const res = await batchAPI.purchase(payload);
      setMsg({ type: 'success', text: res.data || 'Purchase recorded successfully!' });
      setForm(EMPTY_FORM);
      setHasExpiry(false);
      setSelectedProd('');
      setSelectedCat('');
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data || 'Purchase failed. Please try again.',
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
          <ShoppingBag size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">Purchase Stock</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Add new batch stock for a product</p>
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

          {/* Step 1 */}
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

              {/* Product name — list of strings from backend */}
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
                    {/* Backend returns List<String> so each item is the name itself */}
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

        

          {/* Step 2 */}
          <div>
            

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Batch No </label>
                <input
                  type="text" name="batchNo" className={inputCls}
                  value={form.batchNo} onChange={handleChange}
                  placeholder="e.g. BATCH-001" required disabled={submitting}
                />
              </div>
              <div>
                <label className={labelCls}>Current Quantity </label>
                <input
                  type="number" name="currQuantity" className={inputCls}
                  value={form.currQuantity} onChange={handleChange}
                  placeholder="e.g. 100" min="1" required disabled={submitting}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelCls}>Purchase Price (₹) </label>
              <input
                type="number" name="purchasePrice" className={inputCls}
                value={form.purchasePrice} onChange={handleChange}
                placeholder="e.g. 500.00" step="0.01" min="0"
                required disabled={submitting}
              />
            </div>

            <div className="mb-4">
              <label className={labelCls}>Party Name</label>
              <input
                type="text" name="partyName" className={inputCls}
                value={form.partyName} onChange={handleChange}
                placeholder="e.g. Supplier / Vendor name"
                disabled={submitting}
              />
            </div>

            {/* Expiry checkbox */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox" className="sr-only"
                    checked={hasExpiry}
                    onChange={e => setHasExpiry(e.target.checked)}
                    disabled={submitting}
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    hasExpiry ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-300'
                  }`}>
                    {hasExpiry && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-700">This product has an expiry date</span>
                  <p className="text-xs text-slate-400 mt-0.5">Check this if the batch expires</p>
                </div>
              </label>

              {hasExpiry && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className={labelCls}>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      Expiry Date 
                    </span>
                  </label>
                  <input
                    type="date" name="expiryDate" className={inputCls}
                    value={form.expiryDate} onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required={hasExpiry} disabled={submitting}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-3 sm:py-3.5 text-sm sm:text-base transition-all shadow-lg shadow-teal-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting
              ? <><Loader2 size={18} className="animate-spin" />Processing…</>
              : <><ShoppingBag size={18} />Record Purchase</>
            }
          </button>

        </form>
      </div>
    </div>
  );
}
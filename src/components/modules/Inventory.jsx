import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productAPI, batchAPI } from '../../hooks/useApi';
import {
  Search, Pencil, Trash2, ChevronDown, ChevronRight,
  Loader2, CheckCircle, AlertCircle, X, Package, RefreshCw, History, PowerOff,
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Medicine', 'Food', 'Electronics',
  'Clothing', 'Stationery', 'Grocery', 'Other',
];

/* ── Confirm dialog ──────────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel, isDeactivate }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${isDeactivate ? 'bg-orange-100' : 'bg-red-100'}`}>
            {isDeactivate
              ? <PowerOff size={20} className="text-orange-600" />
              : <Trash2 size={20} className="text-red-600" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Confirm</h3>
            <p className="text-sm text-slate-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${isDeactivate ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-600 hover:bg-red-700'}`}>
            {isDeactivate ? 'Deactivate' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit Product modal ──────────────────────────────────────── */
function EditProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    productName:   product.productName   || '',
    category:      product.category      || '',
    minStockLevel: product.minStockLevel || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const isPreset = DEFAULT_CATEGORIES.includes(product.category);
  const [isCustom,    setIsCustom]    = useState(!isPreset && !!product.category);
  const [customInput, setCustomInput] = useState(!isPreset ? product.category : '');

  const inputCls  = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all";
  const labelCls  = "block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-tight";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === '__custom__') { setIsCustom(true); setCustomInput(''); setForm({ ...form, category: '' }); }
    else                      { setIsCustom(false); setForm({ ...form, category: val }); }
  };
  const handleCustomInput = (e) => { setCustomInput(e.target.value); setForm({ ...form, category: e.target.value }); };
  const cancelCustom = () => { setIsCustom(false); setCustomInput(''); setForm({ ...form, category: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      await productAPI.editProduct(product.productCode, {
        productName:   form.productName.trim(),
        category:      form.category.trim(),
        minStockLevel: parseInt(form.minStockLevel),
      });
      onSave();
    } catch (err) { setErr(typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message || 'Failed to update product.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">Edit Product</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={16} className="flex-shrink-0" />{err}
            </div>
          )}
          <div>
            <label className={labelCls}>Product Code</label>
            <input className={inputCls + " opacity-60 cursor-not-allowed"} value={product.productCode} disabled />
          </div>
          <div>
            <label className={labelCls}>Product Name</label>
            <input className={inputCls} value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} required />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            {!isCustom ? (
              <div className="relative">
                <select className={selectCls} value={form.category} onChange={handleCategorySelect} required>
                  <option value="">Select a category…</option>
                  {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">+ Add custom category…</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="text" className={inputCls} value={customInput} onChange={handleCustomInput}
                  placeholder="Type your custom category…" required autoFocus />
                <button type="button" onClick={cancelCustom}
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-300 transition-all">
                  <X size={16} />
                </button>
              </div>
            )}
            {!isCustom && <p className="text-xs text-slate-400 mt-1.5 ml-1">Don't see your category? Choose <span className="font-semibold text-teal-600">+ Add custom category</span>.</p>}
          </div>
          <div>
            <label className={labelCls}>Min Stock Level</label>
            <input className={inputCls} type="number" min="0" value={form.minStockLevel}
              onChange={e => setForm({...form, minStockLevel: e.target.value})} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-base font-semibold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Edit Batch modal ────────────────────────────────────────── */
function EditBatchModal({ batch, onSave, onClose }) {
  const [form, setForm] = useState({
    batchNumber:     batch.batchNumber     || '',
    currentQuantity: batch.currentQuantity || '',
    purchasePrice:   batch.purchasePrice   || '',
    expiryDate:      batch.expiryDate      || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-tight";

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      await batchAPI.editBatch(batch.id, {
        id:              batch.id,
        batchNumber:     form.batchNumber.trim(),
        currentQuantity: parseInt(form.currentQuantity),
        purchasePrice:   parseFloat(form.purchasePrice),
        expiryDate:      form.expiryDate || null,
      });
      onSave();
    } catch (err) { setErr(typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message || 'Failed to update batch.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">Edit Batch</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={16} className="flex-shrink-0" />{err}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Batch Number</label>
              <input className={inputCls} value={form.batchNumber} onChange={e => setForm({...form, batchNumber: e.target.value})} required />
            </div>
            <div>
              <label className={labelCls}>Quantity</label>
              <input className={inputCls} type="number" min="0" value={form.currentQuantity}
                onChange={e => setForm({...form, currentQuantity: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className={labelCls}>Purchase Price (₹)</label>
            <input className={inputCls} type="number" step="0.01" min="0" value={form.purchasePrice}
              onChange={e => setForm({...form, purchasePrice: e.target.value})} required />
          </div>
          <div>
            <label className={labelCls}>Expiry Date</label>
            <input className={inputCls} type="date" value={form.expiryDate || ''} onChange={e => setForm({...form, expiryDate: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-base font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-base font-semibold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Inventory component ────────────────────────────────── */
export default function Inventory() {
  const { user, token, loading: authLoading, isOwner } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]       = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [search, setSearch]           = useState('');
  const [expanded, setExpanded]       = useState({});
  const [fetching, setFetching]       = useState(true);
  const [msg, setMsg]                 = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editBatch, setEditBatch]     = useState(null);
  const [confirm, setConfirm]         = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || !token)) navigate('/login');
  }, [user, token, authLoading, navigate]);

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    try {
      const res  = await productAPI.getAllWithBatches();
      const data = res.data || [];
      setProducts(data);
      setFiltered(data);
      const allCollapsed = {};
      data.forEach(p => { allCollapsed[p.productCode] = false; });
      setExpanded(allCollapsed);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load inventory.' });
    } finally { setFetching(false); }
  }, []);

  useEffect(() => {
    if (!authLoading && token) fetchProducts();
  }, [authLoading, token, fetchProducts]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(products); return; }
    const q = search.toLowerCase();
    setFiltered(products.filter(p =>
      p.productName?.toLowerCase().includes(q) ||
      p.productCode?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ));
  }, [search, products]);

  const toggleExpand = (code) => setExpanded(prev => ({ ...prev, [code]: !prev[code] }));
  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const handleDeleteProduct = (product) => {
    setConfirm({
      isDeactivate: true,
      message: `Deactivate "${product.productName}" and delete all its batches?`,
      onConfirm: async () => {
        setConfirm(null);
        try { await productAPI.deleteProduct(product.productCode); showMsg('success', `${product.productName} deactivated successfully.`); fetchProducts(); }
        catch (err) { showMsg('error', typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message || 'Failed to deactivate product.'); }
      },
    });
  };

  const handleDeleteBatch = (batch, productName) => {
    setConfirm({
      isDeactivate: false,
      message: `Delete batch "${batch.batchNumber}" from ${productName}?`,
      onConfirm: async () => {
        setConfirm(null);
        try { await batchAPI.deleteBatch(batch.id); showMsg('success', `${batch.batchNumber} deleted successfully.`); fetchProducts(); }
        catch (err) { showMsg('error', typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message || 'Failed to delete batch.'); }
      },
    });
  };

  if (authLoading) return null;

  const totalStock = products.reduce((sum, p) => sum + (p.totalQuantity || 0), 0);
  const thCls = "px-4 py-3 text-left text-sm font-bold text-white uppercase tracking-wide whitespace-nowrap";

  return (
    <div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200">
            <Package size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Inventory</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {products.length} product{products.length !== 1 ? 's' : ''} · {totalStock} total units
            </p>
          </div>
        </div>
        <button onClick={fetchProducts} disabled={fetching}
          className="self-start sm:self-auto flex items-center gap-2 text-base font-semibold text-teal-600 border-2 border-teal-200 hover:border-teal-400 bg-teal-50 hover:bg-teal-100 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
          <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {msg && (
        <div className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5 text-base font-medium ${
          msg.type === 'success' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={18} className="text-teal-600 flex-shrink-0" /> : <AlertCircle size={18} className="text-red-500 flex-shrink-0" />}
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-auto p-1 hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by product name, code or category…"
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-11 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
        />
        {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={16} /></button>}
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="font-semibold text-base text-slate-500">{search ? 'No products match your search.' : 'No products found.'}</p>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-4">
            {filtered.map(product => {
              const isOpen   = !!expanded[product.productCode];
              const totalQty = product.totalQuantity || 0;
              const isLow    = totalQty < (product.minStockLevel || 0);
              return (
                <div key={product.productCode} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                  <div className="flex items-start justify-between p-4 gap-3">
                    <button onClick={() => toggleExpand(product.productCode)} className="mt-0.5 p-1 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0">
                      {isOpen ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-800 truncate">{product.productName}</p>
                      <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">{product.productCode}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      
                      {isOwner && (
                        <button onClick={() => navigate(`/dashboard/inventory/history/${product.productCode}`)}
                          className="p-2 rounded-xl hover:bg-teal-100 text-slate-400 hover:text-teal-700 transition-colors" title="View history">
                          <History size={15} />
                        </button>
                      )}
                      {isOwner && (
                        <>
                          <button onClick={() => setEditProduct(product)}
                            className="p-2 rounded-xl hover:bg-teal-100 text-slate-400 hover:text-teal-700 transition-colors" title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDeleteProduct(product)}
                            className="p-2 rounded-xl hover:bg-orange-100 text-slate-400 hover:text-orange-600 transition-colors" title="Deactivate">
                            <PowerOff size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 px-4 pb-4 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Category</p>
                      <span className="text-sm font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-lg">{product.category}</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Stock</p>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-base font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>{totalQty}</span>
                        {product.defaultUnits && <span className="text-xs text-slate-500">{product.defaultUnits}</span>}
                        {isLow && <span className="text-xs bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-md">LOW</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Per Item</p>
                      <p className="text-sm font-semibold text-slate-700">₹{product.perItemPrice?.toFixed(2) ?? '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Total Value</p>
                      <p className="text-sm font-semibold text-slate-700">₹{product.totalPurchasePrice?.toFixed(2) ?? '0.00'}</p>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t-2 border-teal-100 bg-slate-50">
                      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Batches</span>
                        <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">{(product.batches || []).length}</span>
                      </div>
                      {(!product.batches || product.batches.length === 0) ? (
                        <p className="text-sm text-slate-400 text-center py-4">No batches for this product.</p>
                      ) : (
                        <div className="px-3 pb-3 space-y-2">
                          {product.batches.map(batch => {
                            const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date();
                            return (
                              <div key={batch.id ?? batch.batchNumber}
                                className={`rounded-xl border p-3 ${isExpired ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-mono text-sm font-bold text-teal-700">{batch.batchNumber}</span>
                                  {isOwner && (
                                    <div className="flex gap-1">
                                      <button onClick={() => setEditBatch(batch)}
                                        className="p-1.5 rounded-lg hover:bg-teal-100 text-slate-400 hover:text-teal-700 transition-colors">
                                        <Pencil size={13} />
                                      </button>
                                      <button onClick={() => handleDeleteBatch(batch, product.productName)}
                                        className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors">
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div><span className="text-slate-400">Qty: </span><span className="font-semibold text-slate-700">{batch.currentQuantity} {product.defaultUnits || 'units'}</span></div>
                                  <div><span className="text-slate-400">Price: </span><span className="font-semibold text-slate-700">₹{batch.purchasePrice?.toFixed(2)}</span></div>
                                  <div className="col-span-2">
                                    <span className="text-slate-400">Expiry: </span>
                                    {batch.expiryDate
                                      ? <><span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-slate-700'}`}>{batch.expiryDate}</span>{isExpired && <span className="ml-1 bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded text-[10px]">EXPIRED</span>}</>
                                      : <span className="text-slate-400">No expiry</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

  
          <div className="hidden md:block rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-teal-600">
                <thead >
                  <tr>
                    <th className="px-4 py-3 w-10" />
                    <th className={thCls}>Product Name</th>
                    <th className={thCls}>Code</th>
                    <th className={thCls}>Category</th>
                    <th className={thCls}>Stock</th>
                    <th className={thCls}>Per Item</th>
                    <th className={thCls}>Total Value</th>
                    {isOwner && <th className={thCls + " text-right"}>Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((product, idx) => {
                    const isOpen   = !!expanded[product.productCode];
                    const totalQty = product.totalQuantity || 0;
                    const isLow    = totalQty <= (product.minStockLevel || 0);
                    return (
                      <React.Fragment key={product.productCode}>
                        <tr className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-teal-50`}>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleExpand(product.productCode)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                              {isOpen ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                            </button>
                          </td>
                          <td className="px-4 py-3"><span className="text-base font-bold text-slate-800">{product.productName}</span></td>
                          <td className="px-4 py-3"><span className="font-mono text-sm font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">{product.productCode}</span></td>
                          <td className="px-4 py-3"><span className="text-sm font-semibold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-lg">{product.category}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-base font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>{totalQty}</span>
                              {product.defaultUnits && <span className="text-sm text-slate-500">{product.defaultUnits}</span>}
                              {isLow && <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md">LOW</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="text-base font-semibold text-slate-700">₹{product.perItemPrice?.toFixed(2) ?? '0.00'}</span></td>
                          <td className="px-4 py-3"><span className="text-base font-semibold text-slate-700">₹{product.totalPurchasePrice?.toFixed(2) ?? '0.00'}</span></td>
                          {/* ── DESKTOP product actions ── */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* History — owner only */}
                              {isOwner && (
                                <button onClick={() => navigate(`/dashboard/inventory/history/${product.productCode}`)}
                                  className="p-2 rounded-xl hover:bg-teal-100 text-slate-500 hover:text-teal-700 transition-colors" title="View history">
                                  <History size={16} />
                                </button>
                              )}
                              {isOwner && (
                                <>
                                  <button onClick={() => setEditProduct(product)}
                                    className="p-2 rounded-xl hover:bg-teal-100 text-slate-500 hover:text-teal-700 transition-colors" title="Edit">
                                    <Pencil size={16} />
                                  </button>
                                  {/* Deactivate icon for product */}
                                  <button onClick={() => handleDeleteProduct(product)}
                                    className="p-2 rounded-xl hover:bg-orange-100 text-slate-500 hover:text-orange-600 transition-colors" title="Deactivate">
                                    <PowerOff size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr>
                            <td colSpan={8} className="p-0 bg-slate-50 border-t-2 border-teal-100">
                              <div className="flex items-center gap-2 px-6 pt-3 pb-2">
                                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Batches</span>
                                <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">{(product.batches || []).length}</span>
                              </div>
                              {(!product.batches || product.batches.length === 0) ? (
                                <p className="text-sm text-slate-400 text-center py-5 pb-6">No batches for this product.</p>
                              ) : (
                                <div className="px-4 pb-4">
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="bg-slate-200">
                                        <th className="px-4 py-2.5 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Batch No</th>
                                        <th className="px-4 py-2.5 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Quantity</th>
                                        <th className="px-4 py-2.5 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Batch Purchase Price</th>
                                        <th className="px-4 py-2.5 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Expiry Date</th>
                                        {isOwner && <th className="px-4 py-2.5 text-right text-sm font-bold text-slate-700 uppercase tracking-wide">Actions</th>}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {product.batches.map((batch, bi) => {
                                        const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date();
                                        return (
                                          <tr key={batch.id ?? batch.batchNumber}
                                            className={`${isExpired ? 'bg-red-50' : bi % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-teal-50 transition-colors`}>
                                            <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-teal-700">{batch.batchNumber}</span></td>
                                            <td className="px-4 py-3"><span className="text-base font-semibold text-slate-800">{batch.currentQuantity}</span><span className="text-sm text-slate-500 ml-1">{product.defaultUnits || 'units'}</span></td>
                                            <td className="px-4 py-3"><span className="text-base font-semibold text-slate-800">₹{batch.purchasePrice?.toFixed(2)}</span></td>
                                            <td className="px-4 py-3">
                                              {batch.expiryDate ? (
                                                <div className="flex items-center gap-2">
                                                  <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-slate-700'}`}>{batch.expiryDate}</span>
                                                  {isExpired && <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md">EXPIRED</span>}
                                                </div>
                                              ) : <span className="text-sm text-slate-400">No expiry</span>}
                                            </td>
                                            {/* ── DESKTOP batch actions — owner only ── */}
                                            {isOwner && (
                                              <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                  <button onClick={() => setEditBatch(batch)}
                                                    className="p-2 rounded-xl hover:bg-teal-100 text-slate-500 hover:text-teal-700 transition-colors" title="Edit batch">
                                                    <Pencil size={15} />
                                                  </button>
                                                  <button onClick={() => handleDeleteBatch(batch, product.productName)}
                                                    className="p-2 rounded-xl hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors" title="Delete batch">
                                                    <Trash2 size={15} />
                                                  </button>
                                                </div>
                                              </td>
                                            )}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {editProduct && <EditProductModal product={editProduct} onSave={() => { setEditProduct(null); showMsg('success', 'Product updated.'); fetchProducts(); }} onClose={() => setEditProduct(null)} />}
      {editBatch   && <EditBatchModal   batch={editBatch}     onSave={() => { setEditBatch(null);   showMsg('success', 'Batch updated.');   fetchProducts(); }} onClose={() => setEditBatch(null)} />}
      {confirm     && <ConfirmDialog    message={confirm.message} isDeactivate={confirm.isDeactivate} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

    </div>
  );
}
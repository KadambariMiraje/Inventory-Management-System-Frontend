import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { batchAPI } from '../../hooks/useApi';
import {
  Clock, RefreshCw, Search, Loader2,
  X, ShoppingBag, AlertTriangle, CheckCircle,
} from 'lucide-react';

function daysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ days }) {
  if (days < 0)   return <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-lg">Expired</span>;
  if (days === 0) return <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-lg">Expires today</span>;
  if (days <= 7)  return <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-lg">{days}d left</span>;
  if (days <= 30) return <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg">{days}d left</span>;
  return <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg">{days}d left</span>;
}

export default function ExpiringItems() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [allItems, setAllItems] = useState([]);
  const [items,    setItems]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState('');
  const [tab,      setTab]      = useState('expiring'); // 'expiring' | 'expired'
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !token)) navigate('/login');
  }, [user, token, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    setFetching(true); setError('');
    try {
      // Single endpoint — filter expired vs expiring on frontend
      const res = await batchAPI.getExpiring();
      setAllItems(res.data || []);
    } catch {
      setError('Failed to load expiring items.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && token) fetchData();
  }, [authLoading, token, fetchData]);

  // Split into expiring vs expired based on tab
  useEffect(() => {
    const today = new Date();
    if (tab === 'expired') {
      setItems(allItems.filter(b => b.expiryDate && new Date(b.expiryDate) < today));
    } else {
      setItems(allItems.filter(b => b.expiryDate && new Date(b.expiryDate) >= today));
    }
    setSearch('');
  }, [tab, allItems]);

  // Search filter
  useEffect(() => {
    if (!search.trim()) { setFiltered(items); return; }
    const q = search.toLowerCase();
    setFiltered(items.filter(b =>
      b.batchNumber?.toLowerCase().includes(q) ||
      b.productName?.toLowerCase().includes(q) ||
      b.productCode?.toLowerCase().includes(q)
    ));
  }, [search, items]);

  if (authLoading) return null;

  const thCls = "px-4 py-3 text-left text-sm font-bold text-white uppercase tracking-wide whitespace-nowrap";

  const expiredCount  = allItems.filter(b => daysUntilExpiry(b.expiryDate) < 0).length;
  const criticalCount = allItems.filter(b => { const d = daysUntilExpiry(b.expiryDate); return d !== null && d >= 0 && d <= 7; }).length;

  return (
    <div>

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-100">
            <Clock size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Expiring Items</h3>
            <p className="text-sm text-slate-500 mt-0.5">Monitor batch expiry and act before stock goes to waste</p>
          </div>
        </div>
        <button onClick={fetchData} disabled={fetching}
          className="self-start sm:self-auto flex items-center gap-2 text-base font-semibold text-orange-600 border-2 border-orange-200 hover:border-orange-400 bg-orange-50 hover:bg-orange-100 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
          <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5 text-base font-medium bg-red-50 text-red-800 border border-red-200">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />{error}
        </div>
      )}

      {/* Summary stat cards */}
      {!fetching && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Total Batches</p>
            <p className="text-2xl font-bold text-slate-800">{allItems.length}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Critical (≤7 days)</p>
            <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">Already Expired</p>
            <p className="text-2xl font-bold text-amber-700">{expiredCount}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex bg-slate-100 rounded-xl p-1 w-fit">
          {[
            { key: 'expiring', label: 'Expiring Soon' },
            { key: 'expired',  label: 'Already Expired' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t.key ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by batch number, product name or code…"
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-11 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all shadow-sm"
        />
        {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={16} /></button>}
      </div>

      {/* Content */}
      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <CheckCircle size={40} className="mx-auto mb-3 text-teal-400 opacity-60" />
          <p className="font-bold text-base text-slate-700">
            {search ? 'No batches match your search.' : tab === 'expiring' ? 'No batches expiring soon.' : 'No expired batches.'}
          </p>
          {!search && tab === 'expiring' && <p className="text-sm text-slate-400 mt-1">Your inventory is looking fresh!</p>}
        </div>
      ) : (
        <>
          {/* ── MOBILE: card layout ─────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {filtered.map((batch, idx) => {
              const d          = daysUntilExpiry(batch.expiryDate);
              const isExpired  = d !== null && d < 0;
              const isCritical = d !== null && d >= 0 && d <= 7;
              return (
                <div key={batch.id ?? idx}
                  className={`rounded-2xl border p-4 shadow-sm ${isExpired ? 'bg-red-50 border-red-200' : isCritical ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-800 truncate">{batch.productName}</p>
                      <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">{batch.batchNumber}</span>
                    </div>
                    {d !== null && <StatusBadge days={d} />}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div><span className="text-slate-400">Qty: </span><span className="font-semibold text-slate-800">{batch.currentQuantity} {batch.defaultUnits || 'units'}</span></div>
                    <div><span className="text-slate-400">Code: </span><span className="font-mono font-semibold text-slate-700">{batch.productCode}</span></div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Expiry: </span>
                      <span className={`font-semibold ${isExpired ? 'text-red-600' : isCritical ? 'text-amber-700' : 'text-slate-700'}`}>{batch.expiryDate ?? '—'}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/dashboard/purchase')}
                    className="w-full flex items-center justify-center gap-1.5 text-sm font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 py-2 rounded-xl transition-colors">
                    <ShoppingBag size={14} />Restock
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP: table layout ────────────────────────────── */}
          <div className="hidden md:block rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-orange-500">
                  <tr>
                    <th className={thCls}>#</th>
                    <th className={thCls}>Batch No</th>
                    <th className={thCls}>Product Name</th>
                    <th className={thCls}>Code</th>
                    <th className={thCls}>Quantity</th>
                    <th className={thCls}>Expiry Date</th>
                    <th className={thCls}>Status</th>
                    <th className={thCls}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((batch, idx) => {
                    const d          = daysUntilExpiry(batch.expiryDate);
                    const isExpired  = d !== null && d < 0;
                    const isCritical = d !== null && d >= 0 && d <= 7;
                    return (
                      <tr key={batch.id ?? idx}
                        className={`transition-colors hover:bg-orange-50 ${isExpired ? 'bg-red-50' : isCritical ? 'bg-amber-50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="px-4 py-3"><span className="text-sm font-semibold text-slate-500">{idx + 1}</span></td>
                        <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">{batch.batchNumber}</span></td>
                        <td className="px-4 py-3"><span className="text-base font-bold text-slate-800">{batch.productName}</span></td>
                        <td className="px-4 py-3"><span className="font-mono text-sm font-semibold text-slate-600">{batch.productCode}</span></td>
                        <td className="px-4 py-3">
                          <span className="text-base font-semibold text-slate-800">{batch.currentQuantity}</span>
                          <span className="text-sm text-slate-500 ml-1">{batch.defaultUnits || 'units'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${isExpired ? 'text-red-600' : isCritical ? 'text-amber-700' : 'text-slate-700'}`}>
                            {batch.expiryDate ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{d !== null ? <StatusBadge days={d} /> : <span className="text-sm text-slate-400">—</span>}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => navigate('/dashboard/purchase')}
                            className="flex items-center gap-1.5 text-sm font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap">
                            <ShoppingBag size={14} />Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
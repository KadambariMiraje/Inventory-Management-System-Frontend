import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { transactionAPI } from '../../hooks/useApi';
import {
  IndianRupee, RefreshCw, Search, Loader2,
  X, AlertTriangle, TrendingUp, TrendingDown, Filter,
} from 'lucide-react';

export default function Transactions() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('ALL'); // ALL | SALE | PURCHASE
  const [fetching,     setFetching]     = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !token)) navigate('/login');
  }, [user, token, authLoading, navigate]);

  const fetchTransactions = useCallback(async () => {
    setFetching(true);
    setError('');
    try {
      // TODO: update endpoint when shared
      const res = await transactionAPI.getAll({});
      setTransactions(res.data || []);
      setFiltered(res.data || []);
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && token) fetchTransactions();
  }, [authLoading, token, fetchTransactions]);

  // Filter by search + type
  useEffect(() => {
    let result = [...transactions];
    if (typeFilter !== 'ALL') {
      result = result.filter(t => t.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.productName?.toLowerCase().includes(q) ||
        t.product?.productName?.toLowerCase().includes(q) ||
        t.partyName?.toLowerCase().includes(q) ||
        t.customerName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, typeFilter, transactions]);

  if (authLoading) return null;

  const totalSales     = transactions.filter(t => t.type === 'SALE').length;
  const totalPurchases = transactions.filter(t => t.type === 'PURCHASE').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const thCls = "px-4 py-3 text-left text-sm font-bold text-white uppercase tracking-wide whitespace-nowrap";

  return (
    <div>

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200">
            <IndianRupee size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Transactions</h3>
            <p className="text-sm text-slate-500 mt-0.5">Full history of all purchases and sales</p>
          </div>
        </div>
        <button onClick={fetchTransactions} disabled={fetching}
          className="self-start sm:self-auto flex items-center gap-2 text-base font-semibold text-teal-600 border-2 border-teal-200 hover:border-teal-400 bg-teal-50 hover:bg-teal-100 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
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
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-800">{transactions.length}</p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={13} className="text-teal-600" />
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">Purchases</p>
            </div>
            <p className="text-2xl font-bold text-teal-700">{totalPurchases}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={13} className="text-green-600" />
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Sales</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{totalSales}</p>
          </div>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">

        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product or party name…"
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-11 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400 flex-shrink-0" />
          <div className="flex bg-slate-100 rounded-xl p-1">
            {['ALL', 'PURCHASE', 'SALE'].map(type => (
              <button key={type} onClick={() => setTypeFilter(type)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  typeFilter === type
                    ? type === 'SALE'
                      ? 'bg-green-500 text-white shadow-sm'
                      : type === 'PURCHASE'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
                {type === 'ALL' ? 'All' : type === 'PURCHASE' ? 'Purchases' : 'Sales'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Table */}
      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <IndianRupee size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-base text-slate-600">
            {search || typeFilter !== 'ALL' ? 'No transactions match your filter.' : 'No transactions yet.'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {!search && typeFilter === 'ALL' && 'Transactions will appear here once you record a purchase or sale.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">

              <thead className="bg-teal-600">
                <tr>
                  <th className={thCls}>#</th>
                  <th className={thCls}>Type</th>
                  <th className={thCls}>Product</th>
                  <th className={thCls}>Quantity</th>
                  <th className={thCls}>Party / Customer</th>
                  <th className={thCls}>Date</th>
                  <th className={thCls}>Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((txn, idx) => {
                  const isSale     = txn.type === 'SALE';
                  const productName = txn.productName || txn.product?.productName || '—';
                  const partyName   = txn.partyName || txn.customerName || '—';

                  return (
                    <tr key={txn.id ?? idx}
                      className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>

                      {/* # */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-500">{idx + 1}</span>
                      </td>

                      {/* Type badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-xl ${
                          isSale
                            ? 'bg-green-100 text-green-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}>
                          {isSale
                            ? <TrendingUp size={13} />
                            : <TrendingDown size={13} />}
                          {txn.type}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3">
                        <span className="text-base font-bold text-slate-800">{productName}</span>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3">
                        <span className="text-base font-semibold text-slate-800">{txn.quantity}</span>
                        <span className="text-sm text-slate-500 ml-1">units</span>
                      </td>

                      {/* Party */}
                      <td className="px-4 py-3">
                        <span className="text-base text-slate-700">{partyName}</span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {formatDate(txn.transactionDate || txn.date)}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-500">
                          {formatTime(txn.transactionDate || txn.date)}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {/* Footer row showing count */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
            <p className="text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{filtered.length}</span> of{' '}
              <span className="font-bold text-slate-700">{transactions.length}</span> transactions
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
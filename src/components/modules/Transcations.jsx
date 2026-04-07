import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { transactionAPI } from '../../hooks/useApi';
import {
  IndianRupee, RefreshCw, Search, Loader2,
  X, AlertTriangle, TrendingUp, TrendingDown, Filter, Download, Calendar,
} from 'lucide-react';

export default function Transactions() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('ALL');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [fetching,     setFetching]     = useState(true);
  const [error,        setError]        = useState('');
  const [downloading,  setDownloading]  = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !token)) navigate('/login');
  }, [user, token, authLoading, navigate]);

  const fetchTransactions = useCallback(async () => {
    setFetching(true); setError('');
    try {
      const res = await transactionAPI.getAll({});
      setTransactions(res.data || []);
      setFiltered(res.data || []);
    } catch {
      setError('Failed to load transactions.');
    } finally { setFetching(false); }
  }, []);

  useEffect(() => {
    if (!authLoading && token) fetchTransactions();
  }, [authLoading, token, fetchTransactions]);

  useEffect(() => {
    let result = [...transactions];

    if (typeFilter !== 'ALL') result = result.filter(t => t.type === typeFilter);

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(t => t.transactionDate && new Date(t.transactionDate) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(t => t.transactionDate && new Date(t.transactionDate) <= to);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.productName?.toLowerCase().includes(q) ||
        t.productCode?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.partyName?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [search, typeFilter, dateFrom, dateTo, transactions]);

  const clearDateRange = () => { setDateFrom(''); setDateTo(''); };
  const hasDateFilter  = dateFrom || dateTo;

  const 
  downloadXLSX = () => {
    setDownloading(true);

    const generate = () => {
      try {
        const XLSX = window.XLSX;
        if (!XLSX) throw new Error('SheetJS not loaded');

        const formatDate = (dateStr) => {
          if (!dateStr) return '—';
          return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        };
        const formatTime = (dateStr) => {
          if (!dateStr) return '—';
          return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        };

        const headers = ['#', 'Type', 'Product', 'Code', 'Category', 'Quantity', 'Units', 'Amount (₹)', 'Party', 'Date', 'Time'];

        const rows = filtered.map((txn, idx) => [
          idx + 1,
          txn.type || '—',
          txn.productName || '—',
          txn.productCode  || '—',
          txn.category     || '—',
          txn.quantity     ?? 0,
          txn.defaultUnits || 'units',
          txn.totalAmount  != null ? parseFloat(txn.totalAmount.toFixed(2)) : 0,
          txn.partyName    || '—',
          formatDate(txn.transactionDate),
          formatTime(txn.transactionDate),
        ]);

        const tSales     = filtered.filter(t => t.type === 'SALE').length;
        const tPurchases = filtered.filter(t => t.type === 'PURCHASE').length;
        const tAmt       = filtered.reduce((s, t) => s + (t.totalAmount || 0), 0);

        const summaryRows = [
          ['IMS — Transaction Report'],
          [`Store: ${user?.storeName || '—'}`],
          [`Generated: ${new Date().toLocaleString('en-IN')}`],
          [],
          ['Total Transactions', filtered.length, '', 'Purchases', tPurchases, '', 'Sales', tSales, '', 'Total Amount (₹)', parseFloat(tAmt.toFixed(2))],
          [],
          headers,
          ...rows,
        ];

        const ws = XLSX.utils.aoa_to_sheet(summaryRows);

        ws['!cols'] = [
          { wch: 4  },  // #
          { wch: 12 },  // Type
          { wch: 30 },  // Product
          { wch: 14 },  // Code
          { wch: 16 },  // Category
          { wch: 10 },  // Quantity
          { wch: 8  },  // Units
          { wch: 14 },  // Amount
          { wch: 20 },  // Party
          { wch: 16 },  // Date
          { wch: 10 },  // Time
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, `IMS_Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } catch (err) {
        console.error('XLSX error:', err);
        alert('Failed to generate Excel file.');
      } finally {
        setDownloading(false);
      }
    };

    if (window.XLSX) {
      generate();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload  = generate;
      script.onerror = () => { alert('Could not load Excel library.'); setDownloading(false); };
      document.head.appendChild(script);
    }
  };

  if (authLoading) return null;

  const totalSales     = transactions.filter(t => t.type === 'SALE').length;
  const totalPurchases = transactions.filter(t => t.type === 'PURCHASE').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const thCls = "px-4 py-3 text-left text-sm font-bold text-white uppercase tracking-wide whitespace-nowrap";

  return (
    <div>

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
        <div className="flex items-center gap-2 self-start sm:self-auto">

          <button onClick={downloadXLSX} disabled={downloading || fetching || filtered.length === 0}
            className="flex items-center gap-2 text-base font-semibold text-teal-600 border-2 border-teal-200 hover:border-teal-400 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50">
            {downloading
              ? <Loader2 size={16} className="animate-spin" />
              : <Download size={16} />}
            <span className="hidden sm:inline">Download Excel</span>
          </button>

          <button onClick={fetchTransactions} disabled={fetching}
            className="flex items-center gap-2 text-base font-semibold text-teal-600 border-2 border-teal-200 hover:border-teal-400 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50">
            <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5 text-base font-medium bg-red-50 text-red-800 border border-red-200">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />{error}
        </div>
      )}

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

      <div className="flex flex-col gap-3 mb-5">

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by product, code, category or party…"
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-11 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={16} /></button>}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 flex-shrink-0" />
            <div className="flex bg-slate-100 rounded-xl p-1">
              {['ALL', 'PURCHASE', 'SALE'].map(type => (
                <button key={type} onClick={() => setTypeFilter(type)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    typeFilter === type
                      ? type === 'SALE' ? 'bg-green-500 text-white shadow-sm'
                      : type === 'PURCHASE' ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {type === 'ALL' ? 'All' : type === 'PURCHASE' ? 'Purchases' : 'Sales'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Date Range</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold w-6">From</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                max={dateTo || undefined}
                className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold w-6">To</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm" />
            </div>
            {hasDateFilter && (
              <button onClick={clearDateRange}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap">
                <X size={14} />
                Clear dates
              </button>
            )}
            {hasDateFilter && (
              <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-3 py-2.5 rounded-xl whitespace-nowrap">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <IndianRupee size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-base text-slate-600">
            {search || typeFilter !== 'ALL' || hasDateFilter ? 'No transactions match your filter.' : 'No transactions yet.'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {!search && typeFilter === 'ALL' && 'Transactions will appear here once you record a purchase or sale.'}
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE: card layout */}
          <div className="md:hidden space-y-3">
            {filtered.map((txn, idx) => {
              const isSale = txn.type === 'SALE';
              return (
                <div key={txn.id ?? idx}
                  className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 ${idx % 2 !== 0 ? 'bg-slate-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-800 truncate">{txn.productName || <span className="text-slate-400 italic text-sm">Deleted product</span>}</p>
                      <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">{txn.productCode || '—'}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl flex-shrink-0 ${
                      isSale ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {isSale ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {txn.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-400">Qty: </span><span className="font-semibold text-slate-800">{txn.quantity} {txn.defaultUnits || 'units'}</span></div>
                    <div><span className="text-slate-400">Amount: </span><span className="font-semibold text-slate-800">₹{txn.totalAmount?.toFixed(2) ?? '0.00'}</span></div>
                    <div><span className="text-slate-400">Category: </span><span className="font-semibold text-slate-700">{txn.category || '—'}</span></div>
                    <div><span className="text-slate-400">Party: </span><span className="font-semibold text-slate-700">{txn.partyName || '—'}</span></div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Date: </span>
                      <span className="font-semibold text-slate-700">{formatDate(txn.transactionDate)} {formatTime(txn.transactionDate)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP: table layout */}
          <div className="hidden md:block rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-teal-600">
                  <tr>
                    <th className={thCls}>#</th>
                    <th className={thCls}>Type</th>
                    <th className={thCls}>Product</th>
                    <th className={thCls}>Code</th>
                    <th className={thCls}>Category</th>
                    <th className={thCls}>Qty</th>
                    <th className={thCls}>Amount (₹)</th>
                    <th className={thCls}>Party</th>
                    <th className={thCls}>Date</th>
                    <th className={thCls}>Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((txn, idx) => {
                    const isSale = txn.type === 'SALE';
                    return (
                      <tr key={txn.id ?? idx}
                        className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="px-4 py-3"><span className="text-sm font-semibold text-slate-500">{idx + 1}</span></td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-xl ${isSale ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
                            {isSale ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                            {txn.type}
                          </span>
                        </td>
                        <td className="px-4 py-3"><span className="text-base font-bold text-slate-800">{txn.productName || <span className="text-slate-400 italic text-sm font-normal">Deleted product</span>}</span></td>
                        <td className="px-4 py-3"><span className="font-mono text-sm font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">{txn.productCode || '—'}</span></td>
                        <td className="px-4 py-3"><span className="text-sm font-semibold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-lg">{txn.category || '—'}</span></td>
                        <td className="px-4 py-3"><span className="text-base font-semibold text-slate-800">{txn.quantity}</span><span className="text-sm text-slate-500 ml-1">{txn.defaultUnits || 'units'}</span></td>
                        <td className="px-4 py-3"><span className="text-base font-semibold text-slate-800">₹{txn.totalAmount?.toFixed(2) ?? '0.00'}</span></td>
                        <td className="px-4 py-3"><span className="text-base text-slate-700">{txn.partyName || '—'}</span></td>
                        <td className="px-4 py-3"><span className="text-sm font-semibold text-slate-700">{formatDate(txn.transactionDate)}</span></td>
                        <td className="px-4 py-3"><span className="text-sm text-slate-500">{formatTime(txn.transactionDate)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
              <p className="text-sm text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-700">{filtered.length}</span> of{' '}
                <span className="font-bold text-slate-700">{transactions.length}</span> transactions
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
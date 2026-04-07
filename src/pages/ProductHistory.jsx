import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI, productAPI } from '../hooks/useApi';
import {
  ArrowLeft, TrendingUp, TrendingDown, Package,
  RefreshCw, Loader2, AlertTriangle, IndianRupee,
  ShoppingBag, BarChart2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function ProductHistory() {
  const { productCode } = useParams();
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [product,      setProduct]      = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [fetching,     setFetching]     = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !token)) navigate('/login');
  }, [user, token, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    setFetching(true); setError('');
    try {
      const [txnRes, prodRes] = await Promise.all([
        transactionAPI.getAll({}),
        productAPI.getAllWithBatches(),
      ]);
      const allTxns = txnRes.data || [];
      const allProds = prodRes.data || [];

      const prod = allProds.find(p => p.productCode === productCode);
      setProduct(prod || null);

      const filtered = allTxns.filter(t => t.productCode === productCode);
  
      setTransactions(filtered.sort((a, b) =>
        new Date(b.transactionDate) - new Date(a.transactionDate)
      ));
    } catch {
      setError('Failed to load product history.');
    } finally { setFetching(false); }
  }, [productCode]);

  useEffect(() => {
    if (!authLoading && token) fetchData();
  }, [authLoading, token, fetchData]);

  if (authLoading) return null;

  const unit = product?.defaultUnits || 'units';

  const totalPurchased = transactions
    .filter(t => t.type === 'PURCHASE')
    .reduce((s, t) => s + (t.quantity || 0), 0);

  const totalSold = transactions
    .filter(t => t.type === 'SALE')
    .reduce((s, t) => s + (t.quantity || 0), 0);

  const totalRevenue = transactions
    .filter(t => t.type === 'SALE')
    .reduce((s, t) => s + (t.totalAmount || 0), 0);

  const totalSpent = transactions
    .filter(t => t.type === 'PURCHASE')
    .reduce((s, t) => s + (t.totalAmount || 0), 0);

  const chartData = (() => {
    const map = {};
    transactions.forEach(t => {
      if (!t.transactionDate) return;
      const d = new Date(t.transactionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (!map[key]) map[key] = { month: label, Purchased: 0, Sold: 0 };
      if (t.type === 'PURCHASE') map[key].Purchased += t.quantity || 0;
      if (t.type === 'SALE')     map[key].Sold      += t.quantity || 0;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  })();

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  const thCls = "px-4 py-3 text-left text-sm font-bold text-white uppercase tracking-wide whitespace-nowrap";

  return (
    <div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/inventory')}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200">
            <BarChart2 size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
              {product ? product.productName : productCode}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
              <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md text-xs">{productCode}</span>
              {product?.category && <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-lg">{product.category}</span>}
              {product?.defaultUnits && <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-lg">{product.defaultUnits}</span>}
            </p>
          </div>
        </div>
        <button onClick={fetchData} disabled={fetching}
          className="self-start sm:self-auto flex items-center gap-2 text-base font-semibold text-teal-600 border-2 border-teal-200 hover:border-teal-400 bg-teal-50 hover:bg-teal-100 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
          <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5 text-base font-medium bg-red-50 text-red-800 border border-red-200">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />{error}
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-600" />
        </div>
      ) : (
        <>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">

            <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-teal-500 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Package size={15} className="text-teal-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Stock</p>
              </div>
              <p className="text-2xl font-bold text-teal-700">{product?.totalQuantity ?? 0}</p>
              <p className="text-xs text-slate-400 mt-0.5">{unit}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <TrendingDown size={15} className="text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Purchased</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{totalPurchased}</p>
              <p className="text-xs text-slate-400 mt-0.5">{unit}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-green-500 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp size={15} className="text-green-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Sold</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{totalSold}</p>
              <p className="text-xs text-slate-400 mt-0.5">{unit}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Transactions</p>
              <p className="text-xl font-bold text-slate-800">{transactions.length}</p>
              <p className="text-xs text-slate-400">{transactions.filter(t=>t.type==='PURCHASE').length} purchases · {transactions.filter(t=>t.type==='SALE').length} sales</p>
            </div>

          </div>


          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 size={18} className="text-teal-600" />
                <h4 className="text-base font-bold text-slate-800">Monthly Movement</h4>
                <span className="text-xs text-slate-400 ml-1">({unit})</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
                    formatter={(val, name) => [`${val} ${unit}`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
                  <Bar dataKey="Purchased" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sold"      fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-800">Transaction History</h4>
              <span className="text-sm text-slate-400 font-medium">{transactions.length} records</span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={36} className="mx-auto mb-3 text-slate-300" />
                <p className="font-semibold text-base text-slate-500">No transactions yet for this product.</p>
              </div>
            ) : (
              <>

                <div className="md:hidden divide-y divide-slate-100">
                  {transactions.map((t, i) => {
                    const isSale = t.type === 'SALE';
                    return (
                      <div key={t.id ?? i} className="p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl ${
                            isSale ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'
                          }`}>
                            {isSale ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {t.type}
                          </span>
                          <span className="text-sm font-bold text-slate-700">₹{t.totalAmount?.toFixed(2) ?? '0.00'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-sm">
                          <div><span className="text-slate-400">Qty: </span><span className="font-semibold text-slate-800">{t.quantity} {t.defaultUnits || unit}</span></div>
                          <div><span className="text-slate-400">Party: </span><span className="font-semibold text-slate-700">{t.partyName || '—'}</span></div>
                          <div className="col-span-2"><span className="text-slate-400">Date: </span><span className="font-semibold text-slate-700">{formatDate(t.transactionDate)} {formatTime(t.transactionDate)}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-teal-600">
                      <tr>
                        <th className={thCls}>#</th>
                        <th className={thCls}>Type</th>
                        <th className={thCls}>Quantity</th>
                        <th className={thCls}>Amount (₹)</th>
                        <th className={thCls}>Party / Customer</th>
                        <th className={thCls}>Date</th>
                        <th className={thCls}>Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((t, i) => {
                        const isSale = t.type === 'SALE';
                        return (
                          <tr key={t.id ?? i}
                            className={`transition-colors hover:bg-teal-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <td className="px-4 py-3"><span className="text-sm font-semibold text-slate-500">{i + 1}</span></td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-xl ${isSale ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
                                {isSale ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                                {t.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-base font-semibold text-slate-800">{t.quantity}</span>
                              <span className="text-sm text-slate-500 ml-1">{t.defaultUnits || unit}</span>
                            </td>
                            <td className="px-4 py-3"><span className="text-base font-semibold text-slate-800">₹{t.totalAmount?.toFixed(2) ?? '0.00'}</span></td>
                            <td className="px-4 py-3"><span className="text-base text-slate-700">{t.partyName || '—'}</span></td>
                            <td className="px-4 py-3"><span className="text-sm font-semibold text-slate-700">{formatDate(t.transactionDate)}</span></td>
                            <td className="px-4 py-3"><span className="text-sm text-slate-500">{formatTime(t.transactionDate)}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
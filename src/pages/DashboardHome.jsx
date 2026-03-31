import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productAPI, transactionAPI } from '../hooks/useApi';
import {
  Loader2, Package, TrendingUp, TrendingDown,
  AlertTriangle, ShoppingBag, IndianRupee, ArrowRight,
} from 'lucide-react';

export default function DashboardHome() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats,      setStats]      = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [fetching,   setFetching]   = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !token)) navigate('/login');
  }, [user, token, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !user || !token) return;
    const fetchStats = async () => {
      setFetching(true); setError('');
      try {
        const [productsRes, lowStockRes, txnsRes] = await Promise.all([
          productAPI.getAllWithBatches(),
          productAPI.getLowStock(),
          transactionAPI.getAll({}),
        ]);

        const allTxns  = txnsRes.data      || [];
        const products = productsRes.data  || [];
        const lowStock = lowStockRes.data  || [];

        const totalStock = products.reduce((s, p) => s + (p.totalQuantity || 0), 0);
        const totalValue = products.reduce((s, p) => s + (p.totalPurchasePrice || 0), 0);
        const sales      = allTxns.filter(t => t.type === 'SALE');
        const purchases  = allTxns.filter(t => t.type === 'PURCHASE');

        setStats({
          totalProducts: products.length,
          totalStock,
          totalValue,
          lowStockCount: lowStock.length,
          totalSales:    sales.length,
          totalPurchases: purchases.length,
          totalTransactions: allTxns.length,
        });

        setRecentTxns(
          [...allTxns]
            .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
            .slice(0, 5)
        );
      } catch {
        setError('Could not load dashboard data. Please refresh.');
      } finally {
        setFetching(false); }
    };
    fetchStats();
  }, [user, token, authLoading]);

  if (authLoading) return null;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  const statCards = stats ? [
    { label: 'Total Products',    value: stats.totalProducts,    sub: `${stats.totalStock} units in stock`, color: 'teal',   icon: Package,       path: '/dashboard/inventory' },
    { label: 'Total Sales',       value: stats.totalSales,       sub: `${stats.totalPurchases} purchases`,  color: 'green',  icon: TrendingUp,    path: '/dashboard/transactions' },
    { label: 'Low Stock Items',   value: stats.lowStockCount,    sub: 'Need restocking',                    color: 'amber',  icon: AlertTriangle, path: '/dashboard/low-stock' },
    { label: 'Inventory Value',   value: `₹${stats.totalValue.toFixed(0)}`, sub: 'Total purchase value',   color: 'purple', icon: IndianRupee,   path: '/dashboard/inventory' },
  ] : [];

  const colorMap = {
    teal:   { bg: 'bg-teal-50',   border: 'border-l-teal-500',   icon: 'bg-teal-100 text-teal-600',   val: 'text-teal-700'   },
    green:  { bg: 'bg-green-50',  border: 'border-l-green-500',  icon: 'bg-green-100 text-green-600', val: 'text-green-700'  },
    amber:  { bg: 'bg-amber-50',  border: 'border-l-amber-400',  icon: 'bg-amber-100 text-amber-600', val: 'text-amber-600'  },
    purple: { bg: 'bg-purple-50', border: 'border-l-purple-500', icon: 'bg-purple-100 text-purple-600', val: 'text-purple-700' },
  };

  return (
    <div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-600" />
        </div>
      ) : (
        <>
  
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {statCards.map(card => {
              const c    = colorMap[card.color];
              const Icon = card.icon;
              return (
                <button key={card.label} onClick={() => navigate(card.path)}
                  className={`text-left bg-white rounded-2xl shadow-sm border border-slate-200 border-l-4 ${c.border} p-4 sm:p-5 hover:shadow-md transition-all group`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
                      <Icon size={18} />
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                  </div>
                  <p className={`text-xl sm:text-2xl font-bold ${c.val}`}>{card.value}</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">{card.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
            {[
              { label: 'Add Product',   icon: Package,     path: '/dashboard/add-product', color: 'teal'   },
              { label: 'Purchase',      icon: ShoppingBag, path: '/dashboard/purchase',    color: 'teal'   },
              { label: 'Sale',          icon: TrendingUp,  path: '/dashboard/sale',        color: 'green'  },
              { label: 'Low Stock',     icon: AlertTriangle, path: '/dashboard/low-stock', color: 'amber'  },
            ].map(action => {
              const Icon = action.icon;
              const c    = colorMap[action.color];
              return (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 rounded-2xl py-4 sm:py-5 px-3 hover:shadow-md transition-all group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{action.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Recent Transactions</h2>
              <button onClick={() => navigate('/dashboard/transactions')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>

            {recentTxns.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No transactions yet.</p>
            ) : (
              <>

                <div className="md:hidden divide-y divide-slate-100">
                  {recentTxns.map((t, i) => (
                    <div key={t.id ?? i} className="flex items-center gap-3 px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                        t.type === 'SALE' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'
                      }`}>{t.type}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{t.productName || '—'}</p>
                        <p className="text-xs text-slate-400">{t.category || ''}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-700">₹{t.totalAmount?.toFixed(2) ?? '0.00'}</p>
                        <p className="text-xs text-slate-400">{formatDate(t.transactionDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['Type', 'Product', 'Code', 'Category', 'Qty', 'Amount', 'Party', 'Date & Time'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentTxns.map((t, i) => (
                        <tr key={t.id ?? i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl ${
                              t.type === 'SALE' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'
                            }`}>
                              {t.type === 'SALE' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {t.type}
                            </span>
                          </td>
                          <td className="px-4 py-3"><span className="text-sm font-bold text-slate-800">{t.productName || '—'}</span></td>
                          <td className="px-4 py-3"><span className="font-mono text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{t.productCode || '—'}</span></td>
                          <td className="px-4 py-3"><span className="text-sm text-slate-600">{t.category || '—'}</span></td>
                          <td className="px-4 py-3"><span className="text-sm font-semibold text-slate-800">{t.quantity}</span></td>
                          <td className="px-4 py-3"><span className="text-sm font-bold text-slate-800">₹{t.totalAmount?.toFixed(2) ?? '0.00'}</span></td>
                          <td className="px-4 py-3"><span className="text-sm text-slate-600">{t.partyName || '—'}</span></td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-slate-700">{formatDate(t.transactionDate)}</p>
                            <p className="text-xs text-slate-400">{formatTime(t.transactionDate)}</p>
                          </td>
                        </tr>
                      ))}
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
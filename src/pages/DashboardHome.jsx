import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productAPI, transactionAPI } from '../hooks/useApi';
import { Loader2 } from 'lucide-react';

export default function DashboardHome() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]         = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [error, setError]         = useState('');

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !token)) {
      navigate('/login');
    }
  }, [user, token, authLoading, navigate]);

  // Fetch stats after auth confirmed
  useEffect(() => {
    if (authLoading || !user || !token) return;

    const fetchStats = async () => {
      setFetching(true);
      setError('');
      try {
        const [productsRes, lowStockRes, txnsRes] = await Promise.all([
          productAPI.getAll(),
          productAPI.getLowStock(),
          transactionAPI.getAll({}),
        ]);

        const allTxns   = txnsRes.data   || [];
        const products  = productsRes.data || [];
        const lowStock  = lowStockRes.data || [];

        setStats({
          totalProducts: products.length,
          lowStockItems: lowStock.length,
          totalSales:    allTxns.filter(t => t.type === 'SALE').length,
        });

        // 3 most recent transactions
        setRecentTxns(
          [...allTxns]
            .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
            .slice(0, 3)
        );
      } catch (err) {
        setError('Could not load dashboard data. Please refresh.');
      } finally {
        setFetching(false);
      }
    };

    fetchStats();
  }, [user, token, authLoading]);

  if (authLoading) return null;

  return (
    <div>

      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Welcome, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {user?.storeName} — here's a quick overview of your inventory.
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-teal-600" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-teal-500">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Total Products
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-teal-600">
                {stats?.totalProducts ?? 0}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-teal-500">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Total Sales
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-teal-600">
                {stats?.totalSales ?? 0}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-400">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Low Stock Items
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-amber-500">
                {stats?.lowStockItems ?? 0}
              </p>
            </div>

          </section>

          {/* Recent Transactions */}
          <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
              Recent Transactions
            </h2>

            {recentTxns.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No transactions yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentTxns.map((t, i) => (
                  <li key={t.id ?? i} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                        t.type === 'SALE'
                          ? 'bg-teal-50 text-teal-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.type}
                      </span>
                      <span className="text-sm text-slate-700 truncate">
                        {t.productName ?? t.product?.productName ?? '—'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {t.transactionDate
                        ? new Date(t.transactionDate).toLocaleDateString('en-IN')
                        : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

    </div>
  );
}
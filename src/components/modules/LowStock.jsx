import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productAPI } from '../../hooks/useApi';
import {
  AlertTriangle, RefreshCw, Search,
  Loader2, X, ShoppingBag, Package,
} from 'lucide-react';

export default function LowStock() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState('');
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState('');

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !token)) navigate('/login');
  }, [user, token, authLoading, navigate]);

  const fetchLowStock = useCallback(async () => {
    setFetching(true);
    setError('');
    try {
      // TODO: update to real low-stock endpoint when shared
      const res = await productAPI.getLowStock();
      setProducts(res.data || []);
      setFiltered(res.data || []);
    } catch {
      setError('Failed to load low stock data.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && token) fetchLowStock();
  }, [authLoading, token, fetchLowStock]);

  // Search filter
  useEffect(() => {
    if (!search.trim()) { setFiltered(products); return; }
    const q = search.toLowerCase();
    setFiltered(products.filter(p =>
      p.productName?.toLowerCase().includes(q) ||
      p.productCode?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ));
  }, [search, products]);

  if (authLoading) return null;

  const thCls = "px-4 py-3 text-left text-sm font-bold text-white uppercase tracking-wide whitespace-nowrap";

  return (
    <div>

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-100">
            <AlertTriangle size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Low Stock</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Products at or below minimum stock level
            </p>
          </div>
        </div>
        <button onClick={fetchLowStock} disabled={fetching}
          className="self-start sm:self-auto flex items-center gap-2 text-base font-semibold text-teal-600 border-2 border-teal-200 hover:border-teal-400 bg-teal-50 hover:bg-teal-100 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
          <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5 text-base font-medium bg-red-50 text-red-800 border border-red-200">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Summary banner */}
      {!fetching && !error && (
        <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 mb-5 border ${
          products.length === 0
            ? 'bg-teal-50 border-teal-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            products.length === 0 ? 'bg-teal-100' : 'bg-amber-100'
          }`}>
            {products.length === 0
              ? <Package size={20} className="text-teal-600" />
              : <AlertTriangle size={20} className="text-amber-600" />
            }
          </div>
          <div>
            <p className={`text-base font-bold ${products.length === 0 ? 'text-teal-800' : 'text-amber-800'}`}>
              {products.length === 0
                ? 'All products are well stocked!'
                : `${products.length} product${products.length !== 1 ? 's' : ''} need restocking`}
            </p>
            <p className={`text-sm mt-0.5 ${products.length === 0 ? 'text-teal-600' : 'text-amber-600'}`}>
              {products.length === 0
                ? 'No products are below their minimum stock level.'
                : 'Purchase more stock to bring these products above minimum level.'}
            </p>
          </div>
          {products.length > 0 && (
            <button
              onClick={() => navigate('/dashboard/purchase')}
              className="ml-auto flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95 whitespace-nowrap">
              <ShoppingBag size={15} />
              Purchase Stock
            </button>
          )}
        </div>
      )}

      {/* Search */}
      {!fetching && products.length > 0 && (
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name, code or category…"
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-11 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 && products.length > 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="font-semibold text-base text-slate-500">No products match your search.</p>
        </div>
      ) : products.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">

              <thead className="bg-amber-500">
                <tr>
                  <th className={thCls}>#</th>
                  <th className={thCls}>Product Name</th>
                  <th className={thCls}>Code</th>
                  <th className={thCls}>Category</th>
                  <th className={thCls}>Current Stock</th>
                  <th className={thCls}>Min Level</th>
                  <th className={thCls}>Shortfall</th>
                  <th className={thCls}>Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((product, idx) => {
                  const currentStock = product.totalQuantity || 0;
                  const minLevel     = product.minStockLevel || 0;
                  const shortfall    = minLevel - currentStock;

                  return (
                    <tr key={product.productCode}
                      className={`transition-colors hover:bg-amber-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>

                      {/* Row number */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-500">{idx + 1}</span>
                      </td>

                      {/* Product Name */}
                      <td className="px-4 py-3">
                        <span className="text-base font-bold text-slate-800">{product.productName}</span>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">
                          {product.productCode}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-lg">
                          {product.category}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="px-4 py-3">
                        <span className="text-base font-bold text-red-600">{currentStock}</span>
                        <span className="text-sm text-slate-500 ml-1">units</span>
                      </td>

                      {/* Min Level */}
                      <td className="px-4 py-3">
                        <span className="text-base font-semibold text-slate-700">{minLevel}</span>
                        <span className="text-sm text-slate-500 ml-1">units</span>
                      </td>

                      {/* Shortfall */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-lg">
                          -{shortfall} units
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate('/dashboard/purchase')}
                          className="flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap">
                          <ShoppingBag size={14} />
                          Restock
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      ) : null}

    </div>
  );
}
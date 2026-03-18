import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, PlusCircle, Package, ShoppingCart,
  Warehouse, AlertTriangle, Clock, IndianRupee,
  ChevronRight, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",     icon: LayoutDashboard, path: "/dashboard" },
  { label: "Add Products",  icon: PlusCircle,      path: "/dashboard/add-product" },
  { label: "Purchase",      icon: Package,         path: "/dashboard/purchase" },
  { label: "Sale",          icon: ShoppingCart,    path: "/dashboard/sale" },
  { label: "Inventory",     icon: Warehouse,       path: "/dashboard/inventory" },
  { label: "Low Stock",     icon: AlertTriangle,   path: "/dashboard/low-stock" },
  { label: "Expiring Items",icon: Clock,           path: "/dashboard/expiring" },
  { label: "Transactions",  icon: IndianRupee,     path: "/dashboard/transactions" },
];

export default function Sidebar() {
  const { loading } = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  return (
    <>
      {/* HAMBURGER — sits in top-left, vertically centred in navbar (h-16/h-20) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-3 z-[200] p-2 bg-teal-600 text-white rounded-full shadow-lg active:scale-95 transition-transform"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR
          Navbar is sticky so sidebar uses fixed positioning starting from top-0.
          On desktop it sits flush below the sticky navbar naturally via md:top-20.
          On mobile it's full height with its own header matching navbar height. */}
      <aside className={`
        fixed left-0 top-0 bottom-0 z-[160] w-64 bg-slate-50 border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:top-20
      `}>
        {/* Mobile-only header — matches navbar h-16 */}
        <div className="md:hidden h-16 bg-teal-700 flex items-center px-4 gap-3 flex-shrink-0">
          <img src="/logo.png" alt="IMS" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-white font-bold text-sm tracking-widest uppercase">IMS Menu</span>
        </div>

        {/* Nav items */}
        <div className="overflow-y-auto py-4 px-3 space-y-1 h-[calc(100vh-4rem)]">
          {NAV_ITEMS.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-white text-teal-600" : "bg-slate-200 text-slate-500"
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-white/70 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, PlusCircle, Package, ShoppingCart,
  Warehouse, AlertTriangle, Clock, IndianRupee,
  ChevronRight, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Add Products", icon: PlusCircle, path: "/dashboard/add-product" },
  { label: "Purchase", icon: Package, path: "/dashboard/purchase" },
  { label: "Sale", icon: ShoppingCart, path: "/dashboard/sale" },
  { label: "Inventory", icon: Warehouse, path: "/dashboard/inventory" },
  { label: "Low Stock", icon: AlertTriangle, path: "/dashboard/low-stock" },
  { label: "Expiring Items", icon: Clock, path: "/dashboard/expiring" },
  { label: "Transactions", icon: IndianRupee, path: "/dashboard/transactions" },
];

export default function Sidebar() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  return (
    <>
      {/* HAMBURGER - Moved to top-right to avoid logo collision */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-5 right-4 z-[120] p-2 bg-teal-600 text-white rounded-full shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-[110] w-64 bg-slate-50 border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:top-20
      `}>
        <div className="flex flex-col h-full pt-20 md:pt-0">
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? "bg-white text-teal-600 shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      <Icon size={18} />
                    </div>
                    {item.label}
                  </div>
                  {isActive && <ChevronRight size={14} className="text-teal-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
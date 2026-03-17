import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const location = useLocation();
  
  // Format Breadcrumb Title from URL
  const pathParts = location.pathname.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  const displayTitle = (lastPart === 'dashboard' || !lastPart) 
    ? 'Overview' 
    : lastPart.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="transition-all duration-300 pt-20 md:ml-64 min-h-screen">
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto pb-20">
          
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 capitalize tracking-tight">
              {displayTitle}
            </h2>
            <nav className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>IMS</span>
              <span className="text-slate-300">/</span>
              <span className="text-teal-600 font-semibold capitalize">{displayTitle}</span>
            </nav>
          </header>

          {/* INNER PAGE CONTENT */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 min-h-[65vh]">
            <Outlet />
          </div>

          <footer className="mt-12 py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
            © 2026 IMS Portal • Secure Inventory Management
          </footer>
        </div>
      </main>
    </div>
  );
}
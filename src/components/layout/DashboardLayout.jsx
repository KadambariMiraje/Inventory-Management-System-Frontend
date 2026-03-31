import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const pathParts = location.pathname.split("/");
  const lastPart = pathParts[pathParts.length - 1];
  const displayTitle =
    lastPart === "dashboard" || !lastPart
      ? "Overview"
      : lastPart.replace(/-/g, " ");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.fullName?.split(" ")[0] || "";

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 min-h-screen transition-all duration-300">
        <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto pb-20">
    
          <header className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
          
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800 mb-0.5">
                {greeting}
                {`, ${firstName}`}
              </p>

              <h2 className="text-sm sm:text-base text-slate-500 capitalize tracking-tight">
                {displayTitle}
              </h2>
            </div>
          </header>

        
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 min-h-[65vh]">
            <Outlet />
          </div>

          <footer className="mt-8 sm:mt-12 py-4 sm:py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
            © 2026 IMS Portal • Secure Inventory Management
          </footer>
        </div>
      </main>
    </div>
  );
}

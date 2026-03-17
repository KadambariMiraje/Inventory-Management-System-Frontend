import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears user and token from Context/LocalStorage
    navigate("/"); // Redirects to home/landing page
  };

  return (
    // Change this line in Navbar.jsx
    <nav className="sticky top-0 z-50 h-20 bg-white border-b border-teal-100 shadow-sm flex items-center px-4 md:px-16">
      {" "}
      {/* Brand Section */}
      <Link
        to="/"
        className="flex items-center gap-2 md:gap-3 no-underline group"
      >
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-teal-100 p-0.5 flex items-center justify-center transition-transform group-hover:scale-105 bg-white">
          <img
            src="/logo.png"
            alt="IMS"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div className="leading-tight">
          <div className="text-base md:text-[18px] font-bold text-teal-900 tracking-tight">
            IMS
          </div>
          <div className="text-[10px] md:text-[12px] text-teal-500 tracking-wider font-semibold uppercase">
            Inventory Management
          </div>
        </div>
      </Link>
      {/* Right Section */}
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        {user ? (
          <>
            {/* User Profile & Hover Dropdown */}
            <div className="relative group flex items-center gap-2 py-2 cursor-pointer">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-teal-600 border-2 border-teal-100 flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0 shadow-sm transition-transform group-hover:border-teal-400">
                {user.fullName?.charAt(0).toUpperCase() || "U"}
              </div>

              {/* Display Name (Visible on Desktop) */}
              <div className="hidden md:block leading-tight pr-2">
                <div className="text-[13px] font-bold text-teal-900">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-teal-400 font-medium capitalize">
                  {user.storeName}
                </div>
              </div>

              {/* --- HOVER PROFILE CARD --- */}
              <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-teal-50 shadow-2xl rounded-2xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-4 z-[60]">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold border border-teal-100">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">
                      {user.fullName}
                    </h4>
                    <p className="text-[11px] text-gray-400 italic">
                      Store Administrator
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-teal-500 font-bold uppercase tracking-widest mb-0.5">
                      Contact Email
                    </span>
                    <span className="text-sm text-gray-700 truncate font-medium">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-teal-500 font-bold uppercase tracking-widest mb-0.5">
                      Business Name
                    </span>
                    <span className="text-sm text-gray-700 font-medium">
                      {user.storeName}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-teal-500 font-bold uppercase tracking-widest mb-0.5">
                      GST Identification
                    </span>
                    <span className="text-sm font-mono text-teal-700 bg-teal-50/50 px-2 py-1 rounded-lg border border-teal-100 inline-block w-fit">
                      {user.gstNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Divider (Desktop) */}
            <div className="hidden md:block w-px h-8 bg-teal-50 mx-2" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-[12px] md:text-[13px] font-bold text-teal-600 border-2 border-teal-600 rounded-xl px-3 py-1.5 md:px-5 md:py-2 hover:bg-teal-600 hover:text-white active:scale-95 transition-all shadow-sm"
            >
              Log out
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-[12px] md:text-[13px] font-bold text-teal-600 px-3 py-2 md:px-5 md:py-2.5 hover:text-teal-800 transition-all no-underline"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-[12px] md:text-[13px] font-bold text-white bg-teal-600 border border-teal-600 rounded-xl px-4 py-2 md:px-6 md:py-2.5 hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-95 no-underline"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

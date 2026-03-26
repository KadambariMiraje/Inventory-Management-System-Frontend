import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft, LayoutDashboard, LogOut } from "lucide-react"; // Optional: for icons

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        
        {/* Icon Header */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-2">403</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Access Denied</h2>
        
        <p className="text-gray-600 mb-8">
          Sorry, <span className="font-semibold text-gray-900">{user?.name || "User"}</span>. 
          Your account with the role <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-red-600">{user?.role}</span> 
          does not have permission to access this resource.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Logout Option */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout and switch account
        </button>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Internal Security Protocol — Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
      </p>
    </div>
  );
};

export default Unauthorized;
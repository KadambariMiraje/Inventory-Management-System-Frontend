import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Update path to your context file

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // 1. While checking localStorage, don't redirect anywhere
  if (loading) {
    return <div>Loading Authentication...</div>;
  }

  // 2. If not logged in, send them to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in but doesn't have the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. If all checks pass, render the child route
  return <Outlet />;
};

export default ProtectedRoute;
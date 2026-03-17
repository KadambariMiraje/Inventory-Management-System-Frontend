import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/layout/Navbar';
import AuthProvider from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage";
import DashboardHome from './pages/DashboardHome';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="min-h-screen bg-gray-50"> 
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard Parent Route */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* index means this shows up at /dashboard */}
              <Route index element={<DashboardHome />} />
              
              {/* Sub-routes: /dashboard/inventory, etc. */}
              <Route path="add-product" element={<div>Add Product Page</div>} />
              <Route path="inventory" element={<div>Inventory Page</div>} />
              <Route path="purchase" element={<div>Purchase Page</div>} />
              <Route path="sale" element={<div>Sale Page</div>} />
              <Route path="low-stock" element={<div>Low Stock Page</div>} />
              <Route path="expiring" element={<div>Expiring Items Page</div>} />
              <Route path="transactions" element={<div>Transactions Page</div>} />
            </Route>

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </BrowserRouter> 
    </AuthProvider>
  );
}

export default App;
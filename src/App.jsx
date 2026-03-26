import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/layout/Navbar';
import AuthProvider from './context/AuthContext';
import ProtectedRoute from "./hooks/ProtectedRoute";

import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage";
import Unauthorized from "./pages/Unauthorized";

import DashboardHome from './pages/DashboardHome';
import StaffPage from "./pages/StaffPage";
import DashboardLayout from './components/layout/DashboardLayout';
import AddProduct from "./components/modules/AddProducts";
import Purchase from  "./components/modules/Purchase";
import Sale from "./components/modules/Sale"
import HeroPage from "./pages/HeroPage";
import Inventory from "./components/modules/Inventory";
import LowStock from "./components/modules/LowStock";
import ExpiringItems from "./components/modules/ExpiringItems";
import Transcations from "./components/modules/Transcations";
import ProductHistory from "./pages/ProductHistory";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="min-h-screen bg-gray-50"> 
          <Routes>
            
            <Route path="/" element={<HeroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />

              <Route element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]} />}>
                <Route path="add-product"  element={<AddProduct/>} />
                <Route path="/dashboard/staff" element={<StaffPage />} />
              </Route>

              
              <Route path="inventory" element={<Inventory/>} />
              <Route path="purchase" element={<Purchase/>} />
              <Route path="sale" element={<Sale/>} />
              <Route path="low-stock" element={<LowStock/>} />
              <Route path="expiring" element={<ExpiringItems/>} />
              <Route path="transactions" element={<Transcations/>} />
              
              <Route path="inventory/history/:productCode" element={<ProductHistory />} />

            </Route>

            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter> 
    </AuthProvider>
  );
}

export default App;
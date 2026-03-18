import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/layout/Navbar';
import AuthProvider from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage";
import DashboardHome from './pages/DashboardHome';
import DashboardLayout from './components/layout/DashboardLayout';
import AddProduct from "./components/modules/AddProducts";
import Purchase from  "./components/modules/Purchase";
import Sale from "./components/modules/Sale"
import HeroPage from "./pages/HeroPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="min-h-screen bg-gray-50"> 
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<HeroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard Parent Route */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* index means this shows up at /dashboard */}
              <Route index element={<DashboardHome />} />
              
              {/* Sub-routes: /dashboard/inventory, etc. */}
              <Route path="add-product" element={<AddProduct/>} />
              <Route path="inventory" element={<div>Inventory Page</div>} />
              <Route path="purchase" element={<Purchase/>} />
              <Route path="sale" element={<Sale/>} />
              <Route path="low-stock" element={<div>Low Stock Page</div>} />
              <Route path="expiring" element={<div>Expiring Items Page</div>} />
              <Route path="transactions" element={<div>Transactions Page</div>} />
            </Route>

            {/* Root Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter> 
    </AuthProvider>
  );
}

export default App;
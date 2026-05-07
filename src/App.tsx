import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminProducts from './pages/AdminProducts';
import AdminContact from './pages/AdminContact';
import AdminNews from './pages/AdminNews';
import AdminOrders from './pages/AdminOrders';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import AdminLayout from './components/AdminLayout';
import Contact from './pages/Contact';
import NewsDetail from './pages/NewsDetail';
import NewsPage from './pages/NewsPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import { CartProvider } from './context/CartContext';
import QuickContact from './components/QuickContact';
import AdminBanners from './pages/AdminBanners';

// Component bảo vệ Route Admin

// Component bảo vệ Route Admin
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Route công khai */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track-order" element={<OrderTracking />} />

          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Nhóm Route Admin dùng chung Layout */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="banners" element={<AdminBanners />} />
            </Route>        </Routes>
        
        {/* Chỉ hiển thị QuickContact ở trang người dùng, không hiện ở Admin */}
        {!window.location.pathname.startsWith('/admin') && <QuickContact />}
      </Router>
    </CartProvider>
  );
}

export default App;

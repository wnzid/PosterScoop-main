import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Designs from './pages/Designs';
import DesignDetail from './pages/DesignDetail';
import Customize from './pages/Customize';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderComplete from './pages/OrderComplete';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminUpload from './pages/AdminUpload';
import AdminContent from './pages/AdminContent';
import AdminDiscounts from './pages/AdminDiscounts';
import AdminOrders from './pages/AdminOrders';
import AdminPerformance from './pages/AdminPerformance';
import SearchResults from './pages/SearchResults';
import RefundPolicy from './pages/RefundPolicy';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import Account from './pages/Account';
import ProductInfo from './pages/ProductInfo';
import AdminRoute from './components/AdminRoute';
import './App.css';
import { Box, Container } from '@mui/material';

function App() {
  return (
    <Router>
      <Header />
      <Box component="main" sx={{ minHeight: '60vh', py: 2 }}>
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/designs" element={<Designs />} />
            <Route path="/designs/:id" element={<DesignDetail />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-complete" element={<OrderComplete />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/upload" element={<AdminRoute><AdminUpload /></AdminRoute>} />
            <Route path="/admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
            <Route path="/admin/discounts" element={<AdminRoute><AdminDiscounts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route
              path="/admin/performance"
              element={<AdminRoute><AdminPerformance /></AdminRoute>}
            />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/product-info" element={<ProductInfo />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </Router>
  );
}

export default App;

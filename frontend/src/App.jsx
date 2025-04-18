// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Create a simple HomePage component if needed
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from "./pages/CartPage";  // <-- import CartPage
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage'; // <-- Add ProfilePage import






function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* You can add more routes (e.g., /forgot-password) as needed */}
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/products/:productId" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/orders/:orderId" element={<ProfilePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

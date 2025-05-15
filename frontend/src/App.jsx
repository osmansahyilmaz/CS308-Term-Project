import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from "./pages/CartPage";
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutSuccess from './pages/CheckoutSuccess';   // ✅ Eklendi
import InvoicePage from './pages/InvoicePage';           // ✅ Eklendi
import WishlistPage from './components/WishlistPage';


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/products/:productId" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout-success" element={<CheckoutSuccess />} /> {/* ✅ */}
                <Route path="/invoice" element={<InvoicePage />} /> {/* ✅ */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/orders/:orderId" element={<ProfilePage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

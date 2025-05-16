import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider, useAuth } from "./context/AuthContext"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ShopPage from "./pages/ShopPage"
import ProductPage from "./pages/ProductPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import ProfilePage from "./pages/ProfilePage"
import CheckoutSuccess from "./pages/CheckoutSuccess"
import InvoicePage from "./pages/InvoicePage"
import ProductManagementPage from "./pages/ProductManagementPage"
import DeliveryManagementPage from "./pages/DeliveryManagementPage"
import SalesManagementPage from "./pages/SalesManagementPage"
import CommentModerationPage from "./pages/CommentModerationPage"

// Protected Route component that checks for authentication and role
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  // Show loading or redirect while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if user is authenticated and has the required role
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ warning: "You must be logged in to access this page." }} />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" state={{ warning: "You don't have permission to access this page." }} />;
  }

  return element;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/products/:productId" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      <Route path="/invoice" element={<InvoicePage />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/profile/orders/:orderId" element={<ProtectedRoute element={<ProfilePage />} />} />
      
      {/* Product Manager Routes */}
      <Route 
        path="/product-management" 
        element={<ProtectedRoute element={<ProductManagementPage />} allowedRoles={['productManager', 'admin']} />} 
      />
      <Route 
        path="/delivery-management" 
        element={<ProtectedRoute element={<DeliveryManagementPage />} allowedRoles={['productManager', 'admin']} />} 
      />
      <Route 
        path="/comment-moderation" 
        element={<ProtectedRoute element={<CommentModerationPage />} allowedRoles={['productManager', 'admin']} />} 
      />
      
      {/* Sales Manager Routes */}
      <Route 
        path="/sales-management" 
        element={<ProtectedRoute element={<SalesManagementPage />} allowedRoles={['salesManager', 'admin']} />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

// frontend/src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { bootstrapAuth } from "./features/auth/authSlice";
import { fetchCart } from "./features/cart/cartSlice";
import ProtectedRoute from "./components/routing/ProtectedRoute";

// Storefront
import StorefrontLayout from "./components/layout/StorefrontLayout";
import StorefrontPage from "./pages/StorefrontPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AccountPage from "./pages/AccountPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsAdminPage from "./pages/admin/ProductsAdminPage";
import OrdersAdminPage from "./pages/admin/OrdersAdminPage";
import UsersAdminPage from "./pages/admin/UsersAdminPage";

export default function App() {
  const dispatch = useDispatch();
  const { status, isAuthenticated, role } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(bootstrapAuth()); }, [dispatch]);
  useEffect(() => {
    if (isAuthenticated && role === "customer") dispatch(fetchCart());
  }, [isAuthenticated, role, dispatch]);

  if (status === "idle" || status === "loading") {
    return <div className="app-splash">Loading…</div>;
  }

  return (
    <Routes>
      {/* Storefront */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<StorefrontPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
        <Route
          path="/account"
          element={<ProtectedRoute role="customer"><AccountPage /></ProtectedRoute>}
        />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin (nested, RBAC-guarded) */}
      <Route
        path="/admin"
        element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsAdminPage />} />
        <Route path="orders" element={<OrdersAdminPage />} />
        <Route path="users" element={<UsersAdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

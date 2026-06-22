// frontend/src/components/routing/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Frontend half of RBAC (backend enforces the real security).
// role prop optional -> when set, only that role may enter.
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: userRole } = useSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;

  return children;
}

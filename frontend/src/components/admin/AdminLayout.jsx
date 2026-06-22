// frontend/src/components/admin/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import ToastContainer from "../feedback/ToastContainer";
import styles from "./AdminLayout.module.css";

const NAV = [
  { to: "/admin", end: true, label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { to: "/admin/products", label: "Products", icon: "M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { to: "/admin/orders", label: "Orders", icon: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" },
  { to: "/admin/users", label: "Users", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = async () => { await dispatch(logout()); navigate("/"); };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo} />Cartly<span className={styles.accent}>Admin</span>
        </div>
        <nav className={styles.nav}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.user}>
          <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <button className={styles.logout} onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

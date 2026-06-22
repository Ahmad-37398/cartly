// frontend/src/components/layout/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleCartDrawer, addToast } from "../../features/ui/uiSlice";
import { logout } from "../../features/auth/authSlice";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, role } = useSelector((s) => s.auth);
  const itemCount = useSelector((s) => s.cart.itemCount);

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(addToast({ type: "info", message: "Signed out" }));
    navigate("/");
  };

  return (
    <>
      {/* Announcement strip like Edenrobe */}
      <div className="announcement-bar">
        New Collection — Mid Season Sale Now Live
      </div>

      <header className={styles.nav}>
        <div className={styles.inner}>
          {/* Serif brand name */}
          <Link to="/" className={styles.brand}>
            <span className={styles.logo} />
            Cartly<span className={styles.brandAccent}></span>
          </Link>

          <nav className={styles.links}>
            <Link to="/" className={styles.link}>Shop</Link>
            {role === "admin" && <Link to="/admin" className={styles.link}>Admin</Link>}
            {isAuthenticated && role === "customer" && (
              <Link to="/account" className={styles.link}>Orders</Link>
            )}
          </nav>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
                <span className={styles.hello}>Hi, {user?.name?.split(" ")[0]}</span>
                <button className={styles.ghostBtn} onClick={handleLogout}>Sign Out</button>
              </>
            ) : (
              <Link to="/login" className={styles.ghostBtn}>Sign In</Link>
            )}

            {role !== "admin" && (
              <button
                className={styles.cartBtn}
                onClick={() => dispatch(toggleCartDrawer())}
                aria-label="Open cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                </svg>
                {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

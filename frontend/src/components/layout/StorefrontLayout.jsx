// frontend/src/components/layout/StorefrontLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import CartDrawer from "../cart/CartDrawer";
import ToastContainer from "../feedback/ToastContainer";
import styles from "./StorefrontLayout.module.css";

export default function StorefrontLayout() {
  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <CartDrawer />
      <ToastContainer />
    </div>
  );
}

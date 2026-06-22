// frontend/src/pages/CheckoutSuccessPage.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCart } from "../features/cart/cartSlice";
import Button from "../components/ui/Button";
import styles from "./StatusPage.module.css";

export default function CheckoutSuccessPage() {
  const dispatch = useDispatch();
  // Webhook already emptied the cart server-side -> resync so the UI reflects it
  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.ok}`}>✓</div>
        <h1 className={styles.title}>Payment successful</h1>
        <p className={styles.sub}>Thanks for your order! You can track its status in your account.</p>
        <div className={styles.actions}>
          <Link to="/account"><Button>View orders</Button></Link>
          <Link to="/"><Button variant="secondary">Keep shopping</Button></Link>
        </div>
      </div>
    </div>
  );
}

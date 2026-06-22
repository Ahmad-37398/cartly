// frontend/src/pages/CheckoutCancelPage.jsx
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import styles from "./StatusPage.module.css";

export default function CheckoutCancelPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.cancel}`}>↩</div>
        <h1 className={styles.title}>Checkout cancelled</h1>
        <p className={styles.sub}>No charge was made. Your cart is still saved.</p>
        <div className={styles.actions}>
          <Link to="/"><Button>Back to shop</Button></Link>
        </div>
      </div>
    </div>
  );
}

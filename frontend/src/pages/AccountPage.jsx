// frontend/src/pages/AccountPage.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyOrders } from "../features/orders/orderSlice";
import styles from "./AccountPage.module.css";

const badgeClass = (styles, status) => `${styles.badge} ${styles[status] || ""}`;

export default function AccountPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { list, status } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  return (
    <div>
      <h1 className={styles.h1}>My Orders</h1>
      <p className={styles.greet}>Signed in as {user?.email}</p>

      {status === "loading" && <div className={styles.muted}>Loading orders…</div>}
      {status === "ready" && list.length === 0 && <div className={styles.muted}>You have no orders yet.</div>}

      <div className={styles.list}>
        {list.map((o) => (
          <div key={o.id} className={styles.order}>
            <div className={styles.orderHead}>
              <div>
                <span className={styles.orderId}>#{o.id.slice(0, 8)}</span>
                <span className={styles.date}>{new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.badges}>
                <span className={badgeClass(styles, o.paymentStatus)}>{o.paymentStatus}</span>
                <span className={badgeClass(styles, o.deliveryStatus)}>{o.deliveryStatus}</span>
              </div>
            </div>
            <div className={styles.items}>
              {o.items.map((it) => (
                <div key={it.productId} className={styles.item}>
                  <span>{it.quantity} × {it.name}</span>
                  <span>${(it.priceAtPurchase * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className={styles.total}><span>Total</span><strong>${o.totalAmount.toFixed(2)}</strong></div>
          </div>
        ))}
      </div>
    </div>
  );
}

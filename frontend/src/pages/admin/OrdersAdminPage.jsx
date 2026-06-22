// frontend/src/pages/admin/OrdersAdminPage.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAdminOrders, updateDelivery } from "../../features/admin/adminSlice";
import { addToast } from "../../features/ui/uiSlice";
import styles from "./AdminTable.module.css";

const DELIVERY = ["processing", "shipped", "delivered"];

export default function OrdersAdminPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.admin.orders);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAdminOrders(filter ? { paymentStatus: filter } : {}));
  }, [filter, dispatch]);

  const changeDelivery = async (id, deliveryStatus) => {
    const res = await dispatch(updateDelivery({ id, deliveryStatus }));
    if (updateDelivery.fulfilled.match(res)) dispatch(addToast({ type: "success", message: "Delivery updated" }));
    else dispatch(addToast({ type: "error", message: res.payload || "Update failed" }));
  };

  return (
    <div>
      <div className={styles.head}>
        <h1 className={styles.h1}>Orders</h1>
        <div className={styles.tools}>
          <select className={styles.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Delivery</th></tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td><strong>#{o.id.slice(0, 8)}</strong><br /><span style={{ color: "var(--color-text-subtle)", fontSize: "12px" }}>{new Date(o.createdAt).toLocaleDateString()}</span></td>
                <td>{o.customer?.name}<br /><span style={{ color: "var(--color-text-subtle)", fontSize: "12px" }}>{o.customer?.email}</span></td>
                <td>{o.items.reduce((n, it) => n + it.quantity, 0)}</td>
                <td><strong>${o.totalAmount.toFixed(2)}</strong></td>
                <td><span className={`${styles.badge} ${styles[o.paymentStatus]}`}>{o.paymentStatus}</span></td>
                <td>
                  {o.paymentStatus === "paid" ? (
                    <select className={styles.cellSelect} value={o.deliveryStatus} onChange={(e) => changeDelivery(o.id, e.target.value)}>
                      {DELIVERY.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className={styles.muted}>No orders.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

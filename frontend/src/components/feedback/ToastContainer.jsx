// frontend/src/components/feedback/ToastContainer.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../../features/ui/uiSlice";
import styles from "./ToastContainer.module.css";

function Toast({ toast }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(toast.id)), 3200);
    return () => clearTimeout(t);
  }, [toast.id, dispatch]);

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="status">
      <span className={styles.dot} />
      <span className={styles.msg}>{toast.message}</span>
      <button className={styles.close} onClick={() => dispatch(removeToast(toast.id))} aria-label="Dismiss">×</button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useSelector((s) => s.ui.toasts);
  return (
    <div className={styles.wrap}>
      {toasts.map((t) => <Toast key={t.id} toast={t} />)}
    </div>
  );
}

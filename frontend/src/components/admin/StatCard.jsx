// frontend/src/components/admin/StatCard.jsx
import styles from "./StatCard.module.css";

export default function StatCard({ label, value, icon, accent = "primary" }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${styles[accent]}`}>{icon}</div>
      <div>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  );
}

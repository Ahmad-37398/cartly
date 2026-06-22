// frontend/src/components/common/Pagination.jsx
import styles from "./Pagination.module.css";

export default function Pagination({ pagination, onPage }) {
  const { page, totalPages, hasPrev, hasNext } = pagination;
  if (totalPages <= 1) return null;

  return (
    <div className={styles.wrap}>
      <button className={styles.btn} disabled={!hasPrev} onClick={() => onPage(page - 1)}>← Prev</button>
      <span className={styles.info}>Page {page} of {totalPages}</span>
      <button className={styles.btn} disabled={!hasNext} onClick={() => onPage(page + 1)}>Next →</button>
    </div>
  );
}

// frontend/src/components/product/ProductGrid.jsx
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skelCard}>
            <div className={`skeleton ${styles.skelMedia}`} />
            <div className={styles.skelBody}>
              <div className={`skeleton ${styles.skelLine}`} />
              <div className={`skeleton ${styles.skelLineShort}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <div className={styles.empty}>No products match your filters.</div>;
  }

  return (
    <div className={styles.grid}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

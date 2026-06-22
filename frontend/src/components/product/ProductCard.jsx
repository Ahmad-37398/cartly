// frontend/src/components/product/ProductCard.jsx
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../features/cart/cartSlice";
import { addToast, openCartDrawer } from "../../features/ui/uiSlice";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const outOfStock = product.stockQuantity < 1;

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await dispatch(addToCart({ productId: product.id, quantity: 1 }));
    if (addToCart.fulfilled.match(res)) {
      dispatch(addToast({ type: "success", message: `${product.name} added to cart` }));
      dispatch(openCartDrawer());
    } else {
      dispatch(addToast({ type: "error", message: res.payload || "Could not add to cart" }));
    }
  };

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <div className={styles.media}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} />
          : <div className={styles.noimg}>No image</div>}

        {/* Edenrobe-style top-left badge */}
        {!outOfStock && <span className={styles.discountBadge}>NEW</span>}
        {outOfStock && <span className={styles.soldOut}>Sold Out</span>}

        {/* Hover quick-add strip */}
        <button
          className={styles.quickAdd}
          onClick={handleAdd}
          disabled={outOfStock}
        >
          {outOfStock ? "Sold Out" : "Quick Add"}
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.tag}>{product.category}</div>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.price}>${product.price.toFixed(2)}</div>
      </div>
    </Link>
  );
}

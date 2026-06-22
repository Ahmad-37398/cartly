// frontend/src/pages/ProductDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProduct } from "../features/products/productSlice";
import { addToCart } from "../features/cart/cartSlice";
import { addToast, openCartDrawer } from "../features/ui/uiSlice";
import Button from "../components/ui/Button";
import styles from "./ProductDetailPage.module.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((s) => s.products.current);
  const [qty, setQty] = useState(1);

  useEffect(() => { dispatch(fetchProduct(id)); }, [id, dispatch]);

  if (!product) {
    return (
      <div className={styles.loading}>
        <div className={`skeleton ${styles.skelImg}`} />
        <div className={styles.skelCol}>
          <div className={`skeleton ${styles.skelLine}`} />
          <div className={`skeleton ${styles.skelLineShort}`} />
        </div>
      </div>
    );
  }

  const outOfStock = product.stockQuantity < 1;

  const handleAdd = async () => {
    const res = await dispatch(addToCart({ productId: product.id, quantity: qty }));
    if (addToCart.fulfilled.match(res)) {
      dispatch(addToast({ type: "success", message: `Added ${qty} × ${product.name}` }));
      dispatch(openCartDrawer());
    } else {
      dispatch(addToast({ type: "error", message: res.payload || "Could not add to cart" }));
    }
  };

  return (
    <div>
      <Link to="/" className={styles.back}>← Back to shop</Link>
      <div className={styles.layout}>
        <div className={styles.media}>
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className={styles.noimg}>No image</div>}
        </div>
        <div className={styles.info}>
          <span className={styles.tag}>{product.category}</span>
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.price}>${product.price.toFixed(2)}</div>
          <p className={styles.desc}>{product.description || "No description provided."}</p>

          <div className={styles.stock}>
            {outOfStock
              ? <span className={styles.out}>Out of stock</span>
              : <span className={styles.in}>{product.stockQuantity} in stock</span>}
          </div>

          {!outOfStock && (
            <div className={styles.actions}>
              <div className={styles.qty}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))}>+</button>
              </div>
              <Button size="lg" onClick={handleAdd}>Add to cart</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

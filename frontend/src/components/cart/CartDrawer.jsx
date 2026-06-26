// frontend/src/components/cart/CartDrawer.jsx
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { closeCartDrawer, addToast } from "../../features/ui/uiSlice";
import { increaseQuantity, decreaseQuantity, removeFromCart } from "../../features/cart/cartSlice";
import { createCheckout } from "../../features/orders/orderSlice";
import Button from "../ui/Button";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const open = useSelector((s) => s.ui.cartDrawerOpen);
  const { items, total, itemCount } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const checkoutStatus = useSelector((s) => s.orders.checkoutStatus);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      dispatch(closeCartDrawer());
      dispatch(addToast({ type: "info", message: "Please log in to check out" }));
      navigate("/login");
      return;
    }
    const res = await dispatch(createCheckout());
    if (createCheckout.fulfilled.match(res) && res.payload?.url) {
      window.location.href = res.payload.url; // redirect to Stripe
    } else {
      dispatch(addToast({ type: "error", message: res.payload || "Checkout failed" }));
    }
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        onClick={() => dispatch(closeCartDrawer())}
      />
      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`} aria-hidden={!open}>
        <header className={styles.head}>
          <h3>Your Cart {itemCount > 0 && <span className={styles.count}>({itemCount})</span>}</h3>
          <button className={styles.close} onClick={() => dispatch(closeCartDrawer())} aria-label="Close">×</button>
        </header>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🛒</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((it) => (
              <div key={it.productId} className={styles.row}>
                <div className={styles.thumb}>
                  {it.imageUrl ? <img src={it.imageUrl} alt={it.name} /> : <div className={styles.noimg} />}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{it.name}</span>
                  <span className={styles.price}>${it.price.toFixed(2)}</span>
                  <div className={styles.qtyRow}>
                    <button onClick={() => dispatch(decreaseQuantity(it.productId))} aria-label="Decrease">−</button>
                    <span>{it.quantity}</span>
                    <button
                      onClick={() => dispatch(increaseQuantity(it.productId))}
                      disabled={it.quantity >= it.stockQuantity}
                      aria-label="Increase"
                    >+</button>
                  </div>
                </div>
                <div className={styles.lineEnd}>
                  <span className={styles.lineTotal}>${it.lineTotal.toFixed(2)}</span>
                  <button className={styles.remove} onClick={() => dispatch(removeFromCart(it.productId))}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className={styles.foot}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <Button fullWidth size="lg" loading={checkoutStatus === "loading"} onClick={handleCheckout}>
              Checkout
            </Button>
            <p className={styles.note}>Secure payment via Stripe</p>
          </footer>
        )}
      </aside>
    </>
  

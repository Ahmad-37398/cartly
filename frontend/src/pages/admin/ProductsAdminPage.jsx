// frontend/src/pages/admin/ProductsAdminPage.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAdminProducts, createProduct, updateProduct, deleteProduct,
} from "../../features/admin/adminSlice";
import { addToast } from "../../features/ui/uiSlice";
import Button from "../../components/ui/Button";
import ImageUploader from "../../components/admin/ImageUploader";
import styles from "./AdminTable.module.css";

const EMPTY = { name: "", description: "", price: "", stockQuantity: "", category: "", imageUrl: "" };

function ProductModal({ initial, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(initial || EMPTY);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const editing = Boolean(initial?.id);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    setErr(null); setSaving(true);
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      category: form.category || "uncategorized",
      imageUrl: form.imageUrl || null,
    };
    const res = editing
      ? await dispatch(updateProduct({ id: initial.id, body }))
      : await dispatch(createProduct(body));
    setSaving(false);
    if (createProduct.fulfilled.match(res) || updateProduct.fulfilled.match(res)) {
      dispatch(addToast({ type: "success", message: editing ? "Product updated" : "Product created" }));
      onClose();
    } else {
      setErr(res.payload || "Save failed");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{editing ? "Edit product" : "New product"}</h3>
        {err && <div className={styles.err}>{err}</div>}
        <div className={styles.field}><label>Name</label><input name="name" value={form.name} onChange={onChange} /></div>
        <div className={styles.field}><label>Description</label><textarea name="description" rows="3" value={form.description} onChange={onChange} /></div>
        <div className={styles.row2}>
          <div className={styles.field}><label>Price ($)</label><input name="price" type="number" step="0.01" value={form.price} onChange={onChange} /></div>
          <div className={styles.field}><label>Stock</label><input name="stockQuantity" type="number" value={form.stockQuantity} onChange={onChange} /></div>
        </div>
        <div className={styles.field}><label>Category</label><input name="category" value={form.category} onChange={onChange} /></div>
        <div className={styles.field}>
          <label>Product image</label>
          <ImageUploader value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
        </div>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={save}>{editing ? "Save" : "Create"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsAdminPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.admin.products);
  const [modal, setModal] = useState(null); // null | "new" | product object

  useEffect(() => { dispatch(fetchAdminProducts()); }, [dispatch]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    const res = await dispatch(deleteProduct(p.id));
    if (deleteProduct.fulfilled.match(res)) dispatch(addToast({ type: "success", message: "Product deleted" }));
    else dispatch(addToast({ type: "error", message: res.payload || "Delete failed" }));
  };

  return (
    <div>
      <div className={styles.head}>
        <h1 className={styles.h1}>Products</h1>
        <Button onClick={() => setModal("new")}>+ New product</Button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {p.imageUrl ? <img className={styles.thumb} src={p.imageUrl} alt="" /> : <div className={styles.thumb} />}
                  <strong>{p.name}</strong>
                </td>
                <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stockQuantity === 0 ? <span className={`${styles.badge} ${styles.failed}`}>Out</span> : p.stockQuantity}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.iconBtn} onClick={() => setModal(p)}>Edit</button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDelete(p)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" className={styles.muted}>No products yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && <ProductModal initial={modal === "new" ? null : modal} onClose={() => setModal(null)} />}
    </div>
  );
}

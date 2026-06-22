// frontend/src/pages/StorefrontPage.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts, fetchCategories, setPage } from "../features/products/productSlice";
import FiltersBar from "../components/product/FiltersBar";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/common/Pagination";
import styles from "./StorefrontPage.module.css";

export default function StorefrontPage() {
  const dispatch = useDispatch();
  const { items, filters, pagination, status } = useSelector((s) => s.products);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const filtersKey = JSON.stringify(filters);
  useEffect(() => { dispatch(fetchProducts()); }, [filtersKey, pagination.page, dispatch]);

  return (
    <div>
      <div className={styles.hero}>
        <div className={styles.heroLabel}>New Arrivals</div>
        <h1 className={styles.heroTitle}>Discover the<br />New Collection</h1>
      </div>
      <FiltersBar />
      <ProductGrid products={items} loading={status === "loading"} />
      <Pagination pagination={pagination} onPage={(p) => dispatch(setPage(p))} />
    </div>
  );
}

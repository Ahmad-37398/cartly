// frontend/src/components/product/FiltersBar.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFilters } from "../../features/products/productSlice";
import styles from "./FiltersBar.module.css";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name A–Z" },
];

export default function FiltersBar() {
  const dispatch = useDispatch();
  const { filters, categories } = useSelector((s) => s.products);
  const [search, setSearch] = useState(filters.search);

  // Debounce the search box so we don't fire on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== filters.search) dispatch(setFilters({ search }));
    }, 400);
    return () => clearTimeout(t);
  }, [search, filters.search, dispatch]);

  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          className={styles.search}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        className={styles.select}
        value={filters.category}
        onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
      >
        <option value="">All categories</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        className={styles.select}
        value={filters.sort}
        onChange={(e) => dispatch(setFilters({ sort: e.target.value }))}
      >
        {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </div>
  );
}

// frontend/src/features/products/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchProducts = createAsyncThunk("products/fetch", async (params, { getState }) => {
  // Merge current filters/page unless explicit params are passed
  const { filters, pagination } = getState().products;
  const query = {
    page: pagination.page,
    limit: pagination.limit,
    ...filters,
    ...params,
  };
  // strip empty values so the API gets a clean query
  Object.keys(query).forEach((k) => (query[k] === "" || query[k] == null) && delete query[k]);
  const { data } = await api.get("/products", { params: query });
  return data.data; // { products, pagination }
});

export const fetchProduct = createAsyncThunk("products/fetchOne", async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.data.product;
});

export const fetchCategories = createAsyncThunk("products/categories", async () => {
  const { data } = await api.get("/products/categories");
  return data.data.categories;
});

const initialState = {
  items: [],
  current: null,
  categories: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
  filters: { search: "", category: "", sort: "newest", minPrice: "", maxPrice: "" },
  status: "idle",
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (s, a) => {
      s.filters = { ...s.filters, ...a.payload };
      s.pagination.page = 1; // any filter change resets to page 1
    },
    setPage: (s, a) => { s.pagination.page = a.payload; },
    resetFilters: (s) => { s.filters = initialState.filters; s.pagination.page = 1; },
  },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.status = "loading"; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.items = a.payload.products;
        s.pagination = a.payload.pagination;
        s.status = "ready";
      })
      .addCase(fetchProducts.rejected, (s, a) => { s.status = "error"; s.error = a.error.message; })
      .addCase(fetchProduct.pending, (s) => { s.current = null; })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload; });
  },
});

export const { setFilters, setPage, resetFilters } = productSlice.actions;
export default productSlice.reducer;

// frontend/src/features/admin/adminSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const fail = (err) => err.message;

// ---- Dashboard ----
export const fetchDashboard = createAsyncThunk("admin/dashboard", async (params = {}) => {
  const { data } = await api.get("/admin/dashboard", { params });
  return data.data;
});

// ---- Products (admin CRUD reuses the public /products list) ----
export const fetchAdminProducts = createAsyncThunk("admin/products", async (params = {}) => {
  const { data } = await api.get("/products", { params: { limit: 50, ...params } });
  return data.data; // { products, pagination }
});
export const createProduct = createAsyncThunk("admin/createProduct", async (body, { rejectWithValue }) => {
  try { const { data } = await api.post("/products", body); return data.data.product; }
  catch (err) { return rejectWithValue(fail(err)); }
});
export const updateProduct = createAsyncThunk("admin/updateProduct", async ({ id, body }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/products/${id}`, body); return data.data.product; }
  catch (err) { return rejectWithValue(fail(err)); }
});
export const deleteProduct = createAsyncThunk("admin/deleteProduct", async (id, { rejectWithValue }) => {
  try { await api.delete(`/products/${id}`); return id; }
  catch (err) { return rejectWithValue(fail(err)); }
});

// ---- Orders ----
export const fetchAdminOrders = createAsyncThunk("admin/orders", async (params = {}) => {
  const { data } = await api.get("/admin/orders", { params });
  return data.data; // { orders, pagination }
});
export const updateDelivery = createAsyncThunk("admin/updateDelivery", async ({ id, deliveryStatus }, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/admin/orders/${id}/delivery`, { deliveryStatus }); return data.data.order; }
  catch (err) { return rejectWithValue(fail(err)); }
});

// ---- Users ----
export const fetchUsers = createAsyncThunk("admin/users", async (params = {}) => {
  const { data } = await api.get("/admin/users", { params });
  return data.data; // { users, pagination }
});
export const updateUserRole = createAsyncThunk("admin/updateRole", async ({ id, role }, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/admin/users/${id}/role`, { role }); return data.data.user; }
  catch (err) { return rejectWithValue(fail(err)); }
});
export const deleteUser = createAsyncThunk("admin/deleteUser", async (id, { rejectWithValue }) => {
  try { await api.delete(`/admin/users/${id}`); return id; }
  catch (err) { return rejectWithValue(fail(err)); }
});

const initialState = {
  dashboard: null,
  products: { items: [], pagination: {} },
  orders: { items: [], pagination: {} },
  users: { items: [], pagination: {} },
  status: "idle",
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: { clearAdminError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchDashboard.pending, (s) => { s.status = "loading"; })
      .addCase(fetchDashboard.fulfilled, (s, a) => { s.dashboard = a.payload; s.status = "ready"; })

      .addCase(fetchAdminProducts.fulfilled, (s, a) => {
        s.products.items = a.payload.products; s.products.pagination = a.payload.pagination;
      })
      .addCase(createProduct.fulfilled, (s, a) => { s.products.items.unshift(a.payload); })
      .addCase(updateProduct.fulfilled, (s, a) => {
        s.products.items = s.products.items.map((p) => (p.id === a.payload.id ? a.payload : p));
      })
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.products.items = s.products.items.filter((p) => p.id !== a.payload);
      })
      .addCase(deleteProduct.rejected, (s, a) => { s.error = a.payload; })

      .addCase(fetchAdminOrders.fulfilled, (s, a) => {
        s.orders.items = a.payload.orders; s.orders.pagination = a.payload.pagination;
      })
      .addCase(updateDelivery.fulfilled, (s, a) => {
        s.orders.items = s.orders.items.map((o) => (o.id === a.payload.id ? a.payload : o));
      })

      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.users.items = a.payload.users; s.users.pagination = a.payload.pagination;
      })
      .addCase(updateUserRole.fulfilled, (s, a) => {
        s.users.items = s.users.items.map((u) => (u.id === a.payload.id ? { ...u, role: a.payload.role } : u));
      })
      .addCase(updateUserRole.rejected, (s, a) => { s.error = a.payload; })
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.users.items = s.users.items.filter((u) => u.id !== a.payload);
      })
      .addCase(deleteUser.rejected, (s, a) => { s.error = a.payload; });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;

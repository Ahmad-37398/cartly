// frontend/src/features/orders/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Backend builds the Stripe session from the DB cart and returns a redirect URL
export const createCheckout = createAsyncThunk("orders/checkout", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/orders/checkout");
    return data.data; // { url, sessionId }
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMyOrders = createAsyncThunk("orders/fetchMine", async () => {
  const { data } = await api.get("/orders");
  return data.data.orders;
});

const initialState = { list: [], status: "idle", checkoutStatus: "idle", error: null };

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(createCheckout.pending, (s) => { s.checkoutStatus = "loading"; s.error = null; })
      .addCase(createCheckout.fulfilled, (s) => { s.checkoutStatus = "ready"; })
      .addCase(createCheckout.rejected, (s, a) => { s.checkoutStatus = "error"; s.error = a.payload; })
      .addCase(fetchMyOrders.pending, (s) => { s.status = "loading"; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.status = "ready"; s.list = a.payload; })
      .addCase(fetchMyOrders.rejected, (s) => { s.status = "error"; });
  },
});

export default orderSlice.reducer;

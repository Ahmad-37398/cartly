// frontend/src/features/cart/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { logout } from "../auth/authSlice";

// Backend returns the FULL cart (with server totals) on every call.
// Redux never computes the total itself -> server is the source of truth.
export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  const { data } = await api.get("/cart");
  return data.data.cart;
});
// Alias requested in the spec
export const syncCartWithBackend = fetchCart;

export const addToCart = createAsyncThunk("cart/add", async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/cart/items", { productId, quantity });
    return data.data.cart;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const setQuantity = createAsyncThunk("cart/setQty", async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
    return data.data.cart;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeFromCart = createAsyncThunk("cart/remove", async (productId) => {
  const { data } = await api.delete(`/cart/items/${productId}`);
  return data.data.cart;
});

export const clearCart = createAsyncThunk("cart/clear", async () => {
  const { data } = await api.delete("/cart");
  return data.data.cart;
});

// +/- helpers (thunks): decreasing to 0 becomes a remove
export const increaseQuantity = (productId) => (dispatch, getState) => {
  const item = getState().cart.items.find((i) => i.productId === productId);
  if (!item) return;
  return dispatch(setQuantity({ productId, quantity: item.quantity + 1 }));
};
export const decreaseQuantity = (productId) => (dispatch, getState) => {
  const item = getState().cart.items.find((i) => i.productId === productId);
  if (!item) return;
  if (item.quantity <= 1) return dispatch(removeFromCart(productId));
  return dispatch(setQuantity({ productId, quantity: item.quantity - 1 }));
};

const initialState = { items: [], total: 0, itemCount: 0, status: "idle", error: null };

// Replace local cart state with the authoritative server cart
const hydrate = (s, a) => {
  s.items = a.payload.items;
  s.total = a.payload.total;
  s.itemCount = a.payload.itemCount;
  s.status = "ready";
  s.error = null;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchCart.fulfilled, hydrate)
      .addCase(addToCart.fulfilled, hydrate)
      .addCase(setQuantity.fulfilled, hydrate)
      .addCase(removeFromCart.fulfilled, hydrate)
      .addCase(clearCart.fulfilled, hydrate)
      .addCase(addToCart.rejected, (s, a) => { s.error = a.payload; })
      .addCase(setQuantity.rejected, (s, a) => { s.error = a.payload; })
      // wipe cart from memory on logout
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;

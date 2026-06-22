// frontend/src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import productReducer from "../features/products/productSlice";
import uiReducer from "../features/ui/uiSlice";
import orderReducer from "../features/orders/orderSlice";
import adminReducer from "../features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    ui: uiReducer,
    orders: orderReducer,
    admin: adminReducer,
  },
});

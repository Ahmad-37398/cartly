// frontend/src/features/ui/uiSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  cartDrawerOpen: false,
  globalLoading: false,
  toasts: [], // { id, type, message }
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCartDrawer: (s) => { s.cartDrawerOpen = true; },
    closeCartDrawer: (s) => { s.cartDrawerOpen = false; },
    toggleCartDrawer: (s) => { s.cartDrawerOpen = !s.cartDrawerOpen; },
    setGlobalLoading: (s, a) => { s.globalLoading = a.payload; },
    // prepare lets us auto-generate an id while still accepting { type, message }
    addToast: {
      reducer: (s, a) => { s.toasts.push(a.payload); },
      prepare: ({ type = "info", message }) => ({ payload: { id: nanoid(), type, message } }),
    },
    removeToast: (s, a) => { s.toasts = s.toasts.filter((t) => t.id !== a.payload); },
  },
});

export const {
  openCartDrawer, closeCartDrawer, toggleCartDrawer,
  setGlobalLoading, addToast, removeToast,
} = uiSlice.actions;
export default uiSlice.reducer;

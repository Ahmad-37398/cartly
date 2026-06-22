// frontend/src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Runs on app load: cookie -> session restored (auto-login on refresh)
export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.data.user;
  } catch {
    return rejectWithValue(null); // simply not logged in -> not an error state
  }
});

export const login = createAsyncThunk("auth/login", async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", creds);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
  return true;
});

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  status: "idle", // idle | loading | authenticated | unauthenticated
  error: null,
};

const setAuthed = (s, user) => {
  s.user = user;
  s.role = user.role;
  s.isAuthenticated = true;
  s.status = "authenticated";
  s.error = null;
};
const setGuest = (s) => {
  s.user = null;
  s.role = null;
  s.isAuthenticated = false;
  s.status = "unauthenticated";
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(bootstrapAuth.pending, (s) => { s.status = "loading"; })
      .addCase(bootstrapAuth.fulfilled, (s, a) => setAuthed(s, a.payload))
      .addCase(bootstrapAuth.rejected, setGuest)
      .addCase(login.fulfilled, (s, a) => setAuthed(s, a.payload))
      .addCase(login.rejected, (s, a) => { s.error = a.payload; })
      .addCase(register.fulfilled, (s, a) => setAuthed(s, a.payload))
      .addCase(register.rejected, (s, a) => { s.error = a.payload; })
      .addCase(logout.fulfilled, setGuest);
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;

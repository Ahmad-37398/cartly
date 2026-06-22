// frontend/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // send + receive the HTTP-only auth cookie
});

// Normalise errors so thunks always get a clean .message and .data
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "Network error";
    return Promise.reject({ message, data: err.response?.data?.data ?? null, status: err.response?.status });
  }
);

export default api;

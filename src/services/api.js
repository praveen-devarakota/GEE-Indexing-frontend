/**
 * api.js — Axios instance for the GEE Indexing backend.
 *
 * Auth endpoint contract (must match Flask exactly):
 *   POST /register  body: { name, email, password }
 *                   200:  { access_token, user: { id, name, email } }
 *
 *   POST /login     body: { email, password }
 *                   200:  { access_token, user: { id, name, email } }
 *
 *   GET  /profile   header: Authorization: Bearer <token>
 *                   200:  { user: { id, name, email } }
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach stored JWT as Bearer token ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: clear token + redirect on 401 ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    // Surface the backend error message when available
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Auth endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /register
 * Returns { access_token: string, user: { id, name, email } }
 */
export const registerUser = (name, email, password) =>
  api.post("/register", { name, email, password }).then((r) => r.data);

/**
 * POST /login
 * Returns { access_token: string, user: { id, name, email } }
 */
export const loginUser = (email, password) =>
  api.post("/login", { email, password }).then((r) => r.data);

/**
 * GET /profile  (requires Bearer token)
 * Returns { user: { id, name, email } }
 */
export const getProfile = () =>
  api.get("/profile").then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// Satellite / GEE endpoints
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/composite */
export const getComposite = (payload) =>
  api.post("/api/composite", payload).then((r) => r.data);

/** POST /api/timeseries */
export const getTimeseries = (payload) =>
  api.post("/api/timeseries", payload).then((r) => r.data);

/** POST /api/analyze */
export const analyzeRag = (payload) =>
  api.post("/api/analyze", payload).then((r) => r.data);

/** POST /api/chat */
export const chatRag = (payload) =>
  api.post("/api/chat", payload).then((r) => r.data);

export default api;

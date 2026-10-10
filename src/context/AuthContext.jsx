/**
 * AuthContext.jsx
 *
 * Matches the backend contract exactly:
 *   register / login  → response.access_token  +  response.user
 *   profile           → response.user
 *
 * Token is stored under the key "access_token" in localStorage
 * (mirrors the backend field name to avoid confusion).
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, getProfile } from "../services/api";

const TOKEN_KEY = "access_token";

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { id, name, email }
  const [loading, setLoading] = useState(true);   // true while restoring session

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    // Verify token is still valid by hitting GET /profile
    getProfile()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  /**
   * Calls POST /login, stores the token, updates user state.
   * Throws on error so the Login page can display the message.
   */
  const login = async (email, password) => {
    const { access_token, user } = await loginUser(email, password);
    localStorage.setItem(TOKEN_KEY, access_token);
    setUser(user);
  };

  // ── register ──────────────────────────────────────────────────────────────
  /**
   * Calls POST /register, stores the token, updates user state.
   * Throws on error so the Register page can display the message.
   */
  const register = async (name, email, password) => {
    const { access_token, user } = await registerUser(name, email, password);
    localStorage.setItem(TOKEN_KEY, access_token);
    setUser(user);
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

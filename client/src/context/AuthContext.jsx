import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ifai_token"));
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("ifai_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    setAuthToken(token);

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("ifai_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("ifai_token");
        localStorage.removeItem("ifai_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(payload) {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("ifai_token", data.token);
    localStorage.setItem("ifai_user", JSON.stringify(data.user));
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("ifai_token", data.token);
    localStorage.setItem("ifai_user", JSON.stringify(data.user));
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function updateProfile(payload) {
    const { data } = await api.patch("/auth/profile", payload);
    localStorage.setItem("ifai_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function changePassword(payload) {
    const { data } = await api.patch("/auth/password", payload);
    return data;
  }

  function logout() {
    localStorage.removeItem("ifai_token");
    localStorage.removeItem("ifai_user");
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      updateProfile,
      changePassword,
      logout
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

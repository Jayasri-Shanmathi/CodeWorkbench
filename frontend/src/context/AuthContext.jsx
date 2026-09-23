import { useState, useEffect } from "react";
import api, { setCsrfToken, fetchCsrfToken } from "../services/api";
import { AuthContext } from "./auth-context-base";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("cw_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchCsrfToken();
        await api.get("project/");
        setUser((prev) => {
          if (prev) return prev;
          const defaultUser = { username: localStorage.getItem("cw_username") || "Developer" };
          localStorage.setItem("cw_user", JSON.stringify(defaultUser));
          return defaultUser;
        });
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setUser(null);
          localStorage.removeItem("cw_user");
          localStorage.removeItem("cw_username");
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const response = await api.post("login/", { username, password });

    if (response.data?.csrfToken) {
      setCsrfToken(response.data.csrfToken);
    }

    const userData = { username: response.data.username || username };
    setUser(userData);
    localStorage.setItem("cw_user", JSON.stringify(userData));
    localStorage.setItem("cw_username", userData.username);
    return response.data;
  };

  const register = async (username, password, email) => {
    const response = await api.post("register/", { username, password, email });

    if (response.data?.csrfToken) {
      setCsrfToken(response.data.csrfToken);
    }

    const userData = { username: response.data.username || username };
    setUser(userData);
    localStorage.setItem("cw_user", JSON.stringify(userData));
    localStorage.setItem("cw_username", userData.username);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("logout/", {});
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setCsrfToken(null);
      localStorage.removeItem("cw_user");
      localStorage.removeItem("cw_username");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

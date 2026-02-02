 import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// 🔹 ساخت instance axios سراسری
const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// 🔹 Interceptor برای اضافه کردن Authorization به همه requestها
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Interceptor برای مدیریت 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/session/login"; // redirect به login
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 بررسی لاگین قبلی هنگام mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/me") // token به صورت header فرستاده می‌شود
      .then((res) => setUser(res.data.user ?? res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔐 لاگین
  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });

      if (!res.data || !res.data.token) {
        throw new Error("LOGIN_FAILED");
      }

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user ?? { token: res.data.token });

      return res.data;
    } catch (error) {
      setUser(null);
      localStorage.removeItem("token");
      throw error;
    }
  };

  // 🔓 لاگ‌اوت
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth باید داخل AuthProvider استفاده شود");
  return ctx;
};

export default AuthContext;

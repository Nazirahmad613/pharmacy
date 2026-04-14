import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ✅ axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
  },
});

// ✅ Request Interceptor
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

// ✅ Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      if (!window.location.pathname.includes("/session/login")) {
        window.location.href = "/session/login";
      }
    }

    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

// ✅ تابع کمکی برای ساخت آدرس کامل عکس
const getAvatarUrl = (userData) => {
  if (!userData) return null;
  
  // اگر avatar_url وجود دارد
  if (userData.avatar_url) {
    return userData.avatar_url;
  }
  
  // اگر avatar وجود دارد
  if (userData.avatar) {
    // اگر آدرس کامل است
    if (userData.avatar.startsWith('http://') || userData.avatar.startsWith('https://')) {
      return userData.avatar;
    }
    // حذف اسلش اضافی و ساخت آدرس کامل
    const cleanPath = userData.avatar.replace(/^\/+/, '');
    return `http://localhost:8000/storage/${cleanPath}`;
  }
  
  return null;
};

// ✅ تابع برای پردازش اطلاعات کاربر و اضافه کردن avatar_url
const processUserData = (userData) => {
  if (!userData) return null;
  
  return {
    ...userData,
    avatar_url: getAvatarUrl(userData)
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/me")
      .then((res) => {
        const rawUser = res.data.user ?? res.data;
        // ✅ پردازش کاربر و اضافه کردن avatar_url
        const processedUser = processUserData(rawUser);
        setUser(processedUser);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    
    localStorage.setItem("token", res.data.token);
    
    // ✅ پردازش کاربر و اضافه کردن avatar_url
    const processedUser = processUserData(res.data.user);
    setUser(processedUser);
    
    return { ...res.data, user: processedUser };
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/session/signin";
  };

  // ✅ تابع برای به‌روزرسانی کاربر (مثلاً بعد از آپلود عکس)
  const updateUser = (updatedData) => {
    const updatedUser = {
      ...user,
      ...updatedData,
      avatar_url: getAvatarUrl({ ...user, ...updatedData })
    };
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, api, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth باید داخل AuthProvider استفاده شود");
  return ctx;
};

export default AuthContext;
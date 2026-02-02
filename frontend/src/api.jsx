import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false, // چون در CORS ما از توکن Bearer استفاده می‌کنیم و کوکی نداریم
});

// اضافه کردن خودکار توکن به همه درخواست‌ها
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // توکن از لاگین
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// هندل سراسری 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // توکن پاک شود
      window.location.href = "/login"; // هدایت به صفحه ورود
    }
    return Promise.reject(error);
  }
);

export default api;

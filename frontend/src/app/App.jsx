import { CssBaseline } from "@mui/material";
import AnimatedBackground from "../../../frontend/../frontend/src/components/AnimatedBackground";
import { ToastContainer } from "react-toastify";
import routes from "./routes"; // آرایه routes اصلی
import { MatxTheme } from "./components";
import SettingsProvider from "./contexts/SettingsContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, useRoutes, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./i18n";

/* 🔹 کامپوننت واسط برای مسیرهای محافظت‌شده */
function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();

  // اگر کاربر لاگین نکرده → لاگین
  if (!currentUser) return <Navigate to="/session/signin" replace />;

  // اگر نقش مجاز نبود → داشبورد یا صفحه گزارش‌ها
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // اگر hospital_head است → فقط به صفحه گزارش‌ها اجازه بده
    if (currentUser.role === "hospital_head") {
      return <Navigate to="/material/hospital-report" replace />;
    }
    return <Navigate to="/dashboard/default" replace />;
  }

  return children;
}

/* 🔹 کامپوننت واسط برای useRoutes */
function AppRouter() {
  const { currentUser } = useAuth();

  const element = useRoutes(
    routes.map((r) => {
      // هر مسیر را بسته به allowedRoles محافظت می‌کنیم
      return {
        ...r,
        element: r.roles ? (
          <ProtectedRoute allowedRoles={r.roles}>{r.element}</ProtectedRoute>
        ) : (
          r.element
        ),
        children: r.children
          ? r.children.map((c) => ({
              ...c,
              element: c.roles ? (
                <ProtectedRoute allowedRoles={c.roles}>{c.element}</ProtectedRoute>
              ) : (
                c.element
              ),
            }))
          : undefined,
      };
    })
  );

  return element;
}

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("i18nextLng") || "fa";
    i18n.changeLanguage(savedLanguage);

    document.documentElement.setAttribute(
      "dir",
      savedLanguage === "fa" ? "rtl" : "ltr"
    );
    document.documentElement.setAttribute("lang", savedLanguage);
  }, [i18n]);

  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <MatxTheme>
            <CssBaseline />
            <ToastContainer />
            <div style={{ direction: i18n.language === "fa" ? "rtl" : "ltr" }}>
              <AnimatedBackground>
                <AppRouter /> {/* تمام صفحات با بکگراند متحرک و محافظت‌شده */}
              </AnimatedBackground>
            </div>
          </MatxTheme>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
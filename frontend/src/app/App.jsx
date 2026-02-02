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

/* 🔹 کامپوننت واسط برای useRoutes */
function AppRouter() {
  const { user } = useAuth();

  const element = useRoutes([
    ...routes,
    // fallback route → هر مسیر اشتباه به داشبورد یا لاگین هدایت شود
    { path: "*", element: user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace /> },
  ]);

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
                <AppRouter /> {/* تمام صفحات با بکگراند متحرک */}
              </AnimatedBackground>
            </div>
          </MatxTheme>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

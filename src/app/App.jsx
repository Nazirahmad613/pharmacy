 import { CssBaseline } from "@mui/material";
 import AnimatedBackground from "../../../frontend/../frontend/src/components/AnimatedBackground";
import { ToastContainer } from "react-toastify";
import routes from "./routes"; // ⬅️ routes یک آرایه است
import { MatxTheme } from "./components";
import SettingsProvider from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, useRoutes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./i18n";

/* 🔹 کامپوننت واسط برای useRoutes */
function AppRouter() {
  return useRoutes(routes);
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
                <AppRouter /> {/* ⬅️ تمام صفحات بگروند متحرک دارند */}
              </AnimatedBackground>
            </div>
          </MatxTheme>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
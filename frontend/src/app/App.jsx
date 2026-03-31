import { CssBaseline } from "@mui/material";
import AnimatedBackground from "../../../frontend/../frontend/src/components/AnimatedBackground";
import { ToastContainer } from "react-toastify";
import routes from "./routes";
import { MatxTheme } from "./components";
import SettingsProvider from "./contexts/SettingsContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  BrowserRouter,
  useRoutes,
  Navigate
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./i18n";

/* 🔹 Protected Route */
function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/session/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === "hospital_head") {
      return <Navigate to="/material/hospital-report" replace />;
    }
    return <Navigate to="/dashboard/default" replace />;
  }

  return children;
}

/* 🔹 Router */
function AppRouter() {
  const element = useRoutes(
    routes.map((r) => ({
      path: r.path,
      element: r.roles ? (
        <ProtectedRoute allowedRoles={r.roles}>
          {r.element}
        </ProtectedRoute>
      ) : (
        r.element
      ),
      children: r.children
        ? r.children.map((c) => ({
            path: c.path,
            element: c.roles ? (
              <ProtectedRoute allowedRoles={c.roles}>
                {c.element}
              </ProtectedRoute>
            ) : (
              c.element
            ),
          }))
        : undefined,
    }))
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
          <AppRouter />
       
              </AnimatedBackground>
            </div>
            <div>


            </div>
          </MatxTheme>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
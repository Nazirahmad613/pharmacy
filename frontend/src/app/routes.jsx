import { lazy } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";
import materialRoutes from "app/views/material-kit/MaterialRoutes";

// E-CHART PAGE
const AppEchart = Loadable(lazy(() => import("app/views/charts/echarts/AppEchart")));
// DASHBOARD PAGE
const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));

// USERS PAGE
const UsersPage = Loadable(lazy(() => import("../app/views/material-kit/users/UsersPage")));

const routes = [
  // 🔹 ریدایرکت اصلی اصلاح شد (مسیر مطلق)
  { path: "/", element: <Navigate to="/dashboard/default" replace /> },

  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...materialRoutes,

      // Dashboard
      { path: "dashboard/default", element: <Analytics />, auth: authRoles.admin },

      // E-Chart
      { path: "charts/echarts", element: <AppEchart />, auth: authRoles.editor },

      // Users Page (فقط admin)
      { path: "users", element: <UsersPage />, auth: authRoles.admin }
    ]
  },

  // session pages route
  ...sessionRoutes
];

export default routes;
import { lazy } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";
import materialRoutes from "app/views/material-kit/MaterialRoutes";

// Pages
const AppEchart = Loadable(lazy(() => import("app/views/charts/echarts/AppEchart")));
const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));
const UsersPage = Loadable(lazy(() => import("../app/views/material-kit/users/UsersPage")));

// ✅ اضافه شد (صفحه استاک دوا)
const MedicationStockTable = Loadable(
  lazy(() =>
    import("app/views/material-kit/reports/medication-stock/MedicationStockTable")
  )
);

const routes = [
  { path: "/", element: <Navigate to="/dashboard/default" replace /> },

  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...materialRoutes,

      { path: "dashboard/default", element: <Analytics />, auth: authRoles.admin },

      { path: "charts/echarts", element: <AppEchart />, auth: authRoles.editor },

      { path: "users", element: <UsersPage />, auth: authRoles.admin },

      // 🔥 مسیر جدید استاک دوا
      {
        path: "reports/MedicationStockTable",
        element: <MedicationStockTable />,
        auth: authRoles.admin
      }
    ]
  },

  ...sessionRoutes
];

export default routes;
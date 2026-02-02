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

// const EditPrescription = lazy(() => import("./views/material-kit/reports/edit/EditPrescriptions"));

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
      // dashboard route بدون /
      { path: "dashboard/default", element: <Analytics />, auth: authRoles.admin },
      // e-chart route بدون /
      { path: "charts/echarts", element: <AppEchart />, auth: authRoles.editor }
    ]
  },
  //  {
  //   path: "/prescriptions",
  //   element: <PrescriptionList />,
  // },
  // {
  //   path: "/prescriptions/edit/:id",
  //   element: <EditPrescription />,
  // },

  // session pages route
  ...sessionRoutes
];

export default routes;

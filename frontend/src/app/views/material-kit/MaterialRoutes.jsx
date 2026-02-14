import { lazy } from "react";
import Loadable from "app/components/Loadable";

// ===== Material UI Samples =====
const AppForm = Loadable(lazy(() => import("./forms/AppForm")));
const AppMenu = Loadable(lazy(() => import("./menu/AppMenu")));
const AppIcon = Loadable(lazy(() => import("./icons/AppIcon")));
const AppProgress = Loadable(lazy(() => import("./AppProgress")));
const AppRadio = Loadable(lazy(() => import("./radio/AppRadio")));
const AppSwitch = Loadable(lazy(() => import("./switch/AppSwitch")));
const AppSlider = Loadable(lazy(() => import("./slider/AppSlider")));
const AppDialog = Loadable(lazy(() => import("./dialog/AppDialog")));
const AppCheckbox = Loadable(lazy(() => import("./checkbox/AppCheckbox")));
const AppSnackbar = Loadable(lazy(() => import("./snackbar/AppSnackbar")));
const AppExpansionPanel = Loadable(lazy(() => import("./expansion-panel/AppExpansionPanel")));

// ===== Forms & Data Entry =====
const AppAddcatagory = Loadable(lazy(() => import("./addcatagory/addcatagory")));
const AppAddmedication = Loadable(lazy(() => import("./addinformation/addmedication")));
const AppAddchanges = Loadable(lazy(() => import("./changes/addchanges")));
const AppAddprescriptions = Loadable(lazy(() => import("./pres_insert/pres_insert")));
const AppAddsales = Loadable(lazy(() => import("./sales_insert/sales_insert")));
const AppAddparchases = Loadable(lazy(() => import("./parchases/parchases")));
const AppRegistrationForm = Loadable(lazy(() => import("./registrations/RegistrationForm")));

// ===== Reports =====
 
const AppHospital_report = Loadable(lazy(() => import("./reports/Hospital_Report"))); // ✅ اصلاح شد
const AppAccountSummaryPage = Loadable(lazy(() => import("./reports/AccountSummaryPage.jsx")));  
// ===== Routes =====
const materialRoutes = [
  { path: "/material/form", element: <AppForm /> },
  { path: "/material/icons", element: <AppIcon /> },
  { path: "/material/progress", element: <AppProgress /> },
  { path: "/material/menu", element: <AppMenu /> },
  { path: "/material/checkbox", element: <AppCheckbox /> },
  { path: "/material/switch", element: <AppSwitch /> },
  { path: "/material/radio", element: <AppRadio /> },
  { path: "/material/slider", element: <AppSlider /> },
  { path: "/material/expansion-panel", element: <AppExpansionPanel /> },
  { path: "/material/dialog", element: <AppDialog /> },
  { path: "/material/snackbar", element: <AppSnackbar /> },

  { path: "/material/addinformation", element: <AppAddmedication /> },
  { path: "/material/changes", element: <AppAddchanges /> },
  { path: "/material/pres_insert", element: <AppAddprescriptions /> },
  { path: "/material/sales_insert", element: <AppAddsales /> },
  { path: "/material/parchases", element: <AppAddparchases /> },
  { path: "/material/addcatagory", element: <AppAddcatagory /> },
  { path: "/material/registrations", element: <AppRegistrationForm /> },
 
  { path: "/material/hospital-report", element: <AppHospital_report /> },
  { path: "/material/AcountSummaryPage", element: < AppAccountSummaryPage/> },
];

export default materialRoutes;

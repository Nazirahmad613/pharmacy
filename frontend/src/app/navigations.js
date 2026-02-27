const navigations = [
  { name: "dashboard", path: "/dashboard/default", icon: "dashboard", iconText: "D" },

  { label: "pages", type: "label" },
  {
    name: "session_auth",
    children: [
      { name: "sign_in", iconText: "SI", path: "/session/signin" },
      { name: "sign_up", iconText: "SU", path: "/session/signup" },
      { name: "forgot_password", iconText: "FP", path: "/session/forgot-password" },
      { name: "error", iconText: "404", path: "/session/404" },
    ],
  },

  { label: "ثبت معلومات", type: "label" },
  {
    name: "ثبت معلومات جدید",
    iconText: "F",
    roles: [ "user"], // فقط admin و user می توانند این بخش را ببینند
    children: [
      { name: "RegistationForm", path: "/material/registrations", iconText: "RG", roles: ["admin", "user"] },
      { name: "addmedication", path: "/material/addinformation", iconText: "AM", roles: ["admin", "user"] },
      { name: "addchanges", path: "/material/changes", iconText: "AS", roles: ["admin", "user"] },
      { name: "pres_insert", path: "/material/pres_insert", iconText: "PI", roles: ["admin", "user"] },
      { name: "sales_insert", path: "/material/sales_insert", iconText: "SI", roles: ["admin", "user"] },
      { name: "parchases", path: "/material/parchases", iconText: "PR", roles: ["admin", "user"] },
      { name: "addcatagory", path: "/material/addcatagory", iconText: "AC", roles: ["admin", "user"] },
      { name: "PaymentForm", path: "/material/payment", iconText: "py", roles: ["admin", "user"] },
    ],
  },

  // 🔹 بخش مدیریت کاربران فقط برای admin
  { label: "کاربران", type: "label", roles: ["admin"] },
  {
    name: "مدیریت کاربران",
    iconText: "U",
    roles: ["admin"], // فقط admin
    children: [
      {
        name: "مدیریت کاربران",
        path: "/material/users",
        iconText: "U",
        roles: ["admin"], // فقط admin
      },
    ],
  },

  { label: "نمایش اطلاعات", type: "label" },
  {
    name: "گزارش ها",
    iconText: "G",
    // 🔹 گزارش‌ها برای همه کاربران قابل مشاهده است
    children: [
      { name: "hospital_report", path: "/material/hospital-report", iconText: "HR" },
      { name: "AccountSummaryPage", path: "/material/AcountSummaryPage", iconText: "AS" },
    ],
  },

  {
    name: "charts",
    iconText: "C",
    roles: ["admin", "user"], // فقط admin و user
    children: [{ name: "echarts", path: "/charts/echarts", iconText: "E", roles: ["admin", "user"] }],
  },

  {
    name: "documentation",
    icon: "launch",
    iconText: "D",
  },
];

export default navigations;
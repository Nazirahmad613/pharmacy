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
    roles: ["user", "admin", "super_admin"], // سوپر ادمین هم می‌تواند ببیند
    children: [
      { name: "RegistationForm", path: "/material/registrations", iconText: "RG", roles: ["admin", "user", "super_admin"] },
      { name: "addmedication", path: "/material/addinformation", iconText: "AM", roles: ["admin", "user", "super_admin"] },
      { name: "addchanges", path: "/material/changes", iconText: "AS", roles: ["admin", "user", "super_admin"] },
      { name: "pres_insert", path: "/material/pres_insert", iconText: "PI", roles: ["admin", "user", "super_admin"] },
      { name: "sales_insert", path: "/material/sales_insert", iconText: "SI", roles: ["admin", "user", "super_admin"] },
      { name: "parchases", path: "/material/parchases", iconText: "PR", roles: ["admin", "user", "super_admin"] },
      { name: "addcatagory", path: "/material/addcatagory", iconText: "AC", roles: ["admin", "user", "super_admin"] },
      { name: "PaymentForm", path: "/material/payment", iconText: "py", roles: ["admin", "user", "super_admin"] },
    ],
  },

  { label: "کاربران", type: "label", roles: ["admin", "super_admin"] },
  {
    name: "مدیریت کاربران",
    iconText: "U",
    roles: ["admin", "super_admin"], // سوپر ادمین هم اجازه دارد
    children: [
      {
        name: "مدیریت کاربران",
        path: "/material/users",
        iconText: "U",
        roles: ["admin", "super_admin"],
      },
    ],
  },

  { label: "نمایش اطلاعات", type: "label" },
  {
    name: "گزارش ها",
    iconText: "G",
    roles: ["user", "admin", "super_admin","hospital_head"], // همه می‌توانند ببینند
    children: [
      { name: "hospital_report", path: "/material/hospital-report", iconText: "HR", roles: ["user", "admin", "super_admin"] },
      { name: "AccountSummaryPage", path: "/material/AcountSummaryPage", iconText: "AS", roles: ["user", "admin", "super_admin"] },
    ],
  },

  {
    name: "charts",
    iconText: "C",
    roles: ["admin", "user", "super_admin"], // سوپر ادمین هم ببیند
    children: [{ name: "echarts", path: "/charts/echarts", iconText: "E", roles: ["admin", "user", "super_admin"] }],
  },

  {
    name: "documentation",
    icon: "launch",
    iconText: "D",
    roles: ["admin", "user", "super_admin"],
  },
];

export default navigations;
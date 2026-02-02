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
    children: [
      { name: "RegistationForm", path: "/material/addinformation", iconText: "AM" },
      { name: "RegistationForm", path: "/material/regitrations", iconText: "RG" },
      { name: "addsuppliers", path: "/material/tables", iconText: "AS" },
      { name: "addcustomers", path: "/material/addcustomers", iconText: "AC" },
      { name: "doctor_insert", path: "/material/doctor_insert", iconText: "DI" },
      { name: "pres_insert", path: "/material/pres_insert", iconText: "PI" },
      { name: "sales_insert", path: "/material/sales_insert", iconText: "SI" },
      { name: "parchases", path: "/material/parchases", iconText: "PR" },
      { name: "addcatagory", path: "/material/addcatagory", iconText: "AC" },
    ],
  },

  { label: "نمایش اطلاعات", type: "label" },
  {
    name: "گزارش ها",
    iconText: "G",
    children: [
  
     
      {name: "stock_report",path:"/material/reports",iconText:"ST"},
    ],
  },

  {
    name: "charts",
    iconText: "C",
    children: [{ name: "echarts", path: "/charts/echarts", iconText: "E" }],
  },

  {
    name: "documentation",
    icon: "launch",
    iconText: "D",
  },
];

export default navigations;

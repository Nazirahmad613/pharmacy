import { Fragment } from "react";
import Scrollbar from "react-perfect-scrollbar";
import styled from "@mui/material/styles/styled";

import { MatxVerticalNav } from "app/components";
import useSettings from "app/hooks/useSettings";
import { useTranslation } from "react-i18next";
import navigationsData from "app/navigations";

// STYLED COMPONENTS
const StyledScrollBar = styled(Scrollbar)(() => ({
  paddingLeft: "1rem",
  paddingRight: "1rem",
  position: "relative",
  height: "100vh", // ✅ ارتفاع کامل برای اسکرول
 
}));

const SideNavMobile = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "250px", // ✅ عرض مشخص
  height: "100vh", // ✅ ارتفاع مشخص
  overflowY: "auto", // ✅ فعال کردن اسکرول
  background: "rgba(0, 0, 0, 0.54)",
  zIndex: 999, // ✅ نمایش در بالاترین سطح
  [theme.breakpoints.up("lg")]: { display: "none" },
}));

export default function Sidenav({ children }) {
  const { settings } = useSettings();
  const { t } = useTranslation();

  // ترجمه آیتم‌های منو
  const navigations = Array.isArray(navigationsData)
  ? navigationsData.map((item) => ({
    ...item,
    name: t(item.name),
    label: item.label ? t(item.label) : undefined,
    iconText: item.iconText ? t(item.iconText) : undefined, // ✅ پردازش مقدار iconText
    children: Array.isArray(item.children)
      ? item.children.map((child) => ({
          ...child,
          name: t(child.name),
         
        }))
      : undefined,
  }))
: [];








    
  return (
    <Fragment>
      <StyledScrollBar options={{ suppressScrollX: true }}>
        {children}
        <MatxVerticalNav items={navigations} />
      </StyledScrollBar>
    </Fragment>
  );
}

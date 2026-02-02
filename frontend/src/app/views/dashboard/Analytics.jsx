import { Fragment } from "react";
import { useTranslation } from 'react-i18next'; 
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { styled, useTheme } from "@mui/material/styles";

import RowCards from "./shared/RowCards";
import StatCards from "./shared/StatCards";
import Campaigns from "./shared/Campaigns";
import StatCards2 from "./shared/StatCards2";
import DoughnutChart from "./shared/Doughnut";
import UpgradeCard from "./shared/UpgradeCard";
import TopSellingTable from "./shared/TopSellingTable";

// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);  // تغییر زبان
  localStorage.setItem("i18nextLng", lng);  // ذخیره زبان در localStorage

  // تغییر جهت صفحه بر اساس زبان
  if (lng === "fa") {
    document.documentElement.setAttribute("dir", "rtl");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
  }
};


const Title = styled("span")(() => ({
  fontSize: "1rem",
  fontWeight: "500",
  marginRight: ".5rem",
  textTransform: "capitalize"
}));

const SubTitle = styled("span")(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary
}));

const H4 = styled("h4")(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: "500",
  marginBottom: "1rem",
  textTransform: "capitalize",
  color: theme.palette.text.secondary
}));

// کامپوننت LanguageSwitcher برای تغییر زبان
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // تغییر زبان
    localStorage.setItem("i18nextLng", lng); // ذخیره زبان در localStorage
  };

  return (
    <div style={{ textAlign: "right", marginBottom: "1rem" }}>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fa')}>فارسی</button>
    </div>
  );
};

export default function Analytics() {
  const theme = useTheme();
  const { t, i18n } = useTranslation(); // استفاده از useTranslation برای ترجمه‌ها

  return (
    <Fragment>
      {/* اضافه کردن دکمه تغییر زبان */}
      <LanguageSwitcher />

      <ContentBox className="analytics">
        <Grid container spacing={3}>
          <Grid item md={8} xs={12}>
            <StatCards />
            <TopSellingTable />
            <StatCards2 />

            <H4>{t("ongoing_projects")}</H4> {/* ترجمه عنوان */}
            <RowCards />
          </Grid>

          <Grid item md={4} xs={12}>
            <Card sx={{ px: 3, py: 2, mb: 3 }}>
              <Title>{t("traffic_sources")}</Title>
              <SubTitle>{t("last_30_days")}</SubTitle>

              <DoughnutChart
                height="300px"
                color={[theme.palette.primary.dark, theme.palette.primary.main, theme.palette.primary.light]}
              />
            </Card>

            <UpgradeCard />
            <Campaigns />
          </Grid>
        </Grid>
      </ContentBox>
    </Fragment>
  );
}

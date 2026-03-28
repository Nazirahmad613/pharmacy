import { Fragment } from "react";
import { useTranslation } from 'react-i18next'; 
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { styled, useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
 

import RowCards from "./shared/RowCards";
import StatCards from "./shared/StatCards";
import Campaigns from "./shared/Campaigns";
import StatCards2 from "./shared/StatCards2";
import UpgradeCard from "./shared/UpgradeCard";
// import TopSellingTable from "./shared/TopSellingTable"; // حذف شد
import MainLayoutjur from "../../../components/Mainlayoutjur";
import MedicationStockChart from "../material-kit/reports/medication-stock/MedicationStockChart";
import SalesTable from "../material-kit/reports/sales/SalesTable";

const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem", 
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

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

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
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
  const { t } = useTranslation();

  return (
    <MainLayoutjur>
      <Fragment>
        <LanguageSwitcher />

        <ContentBox className="analytics">
          <Grid container spacing={3}>
            <Grid item md={8} xs={12}>
              <StatCards />
              {/* جایگزینی پرفروش‌ترین محصولات با گزارش فروش */}
              <SalesTable />
              <StatCards2 />

              <H4>{t("ongoing_projects")}</H4>
              <RowCards />
            </Grid>

            <Grid item md={4} xs={12}>
              {/* کارت نمودار با دکمه ثابت در پایین */}
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 500,
                  px: 3,
                  py: 2,
                  mb: 3
                }}
              >
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <MedicationStockChart />
                </Box>
                <Box mt={2} textAlign="center">
              <Link to="/reports/MedicationStockTable" style={{ textDecoration: "none" }}>
  <Button variant="outlined" color="prima" size="small">
    دیدن جزئیات
  </Button>
</Link>
                </Box>
              </Card>

              <UpgradeCard />
              <Campaigns />
            </Grid>
          </Grid>
        </ContentBox>
      </Fragment>
    </MainLayoutjur>
  );
}
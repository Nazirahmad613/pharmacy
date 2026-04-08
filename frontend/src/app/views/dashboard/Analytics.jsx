// فایل Analytics.js
import { Fragment } from "react";
import { useTranslation } from 'react-i18next';
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import MainLayoutjur from "../../../components/Mainlayoutjur";
import MedicationStockChart from "../material-kit/reports/medication-stock/MedicationStockChart";
import SalesChart from "../material-kit/reports/sales/SalesChart";
import DashboardDailyChart from "../material-kit/reports/dashboard/DashboardDailyChart";
import BenefitsChart from "../material-kit/reports/BenefitsChart";
import SimpleClock from "../material-kit/SimpleClock"; // یا مسیر صحیح

const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
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
  const { t } = useTranslation();

  return (
    <MainLayoutjur>
      <Fragment>
        {/* هدر بالا: ساعت در چپ، سوئیچ زبان در راست */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 1,
            backgroundColor: 'transparent', // بدون پس‌زمینه
          }}
        >
          <SimpleClock />
          <LanguageSwitcher />
        </Box>

        <ContentBox className="analytics">
          <Grid container spacing={3}>
            {/* سطر اول - دو بخش مساوی */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: 400,
                  overflow: "auto",
                  px: 3,
                  py: 2,
                }}
              >
                <DashboardDailyChart />
                <Box mt={2} textAlign="center">
                  <Link to="/reports/DashboardDailyTable" style={{ textDecoration: "none" }}>
                    مشاهده جزئیات گزارش روزانه
                  </Link>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: 400,
                  display: "flex",
                  flexDirection: "column",
                  px: 3,
                  py: 2,
                }}
              >
                <Box sx={{ flex: 1, overflow: "auto" }}>
                  <MedicationStockChart />
                </Box>
                <Box mt={2} textAlign="center">
                  <Link to="/reports/MedicationStockTable">
                    <Button variant="outlined">دیدن جزئیات</Button>
                  </Link>
                </Box>
              </Card>
            </Grid>

            {/* سطر دوم - فواید + فروش */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ px: 3, py: 2, height: "100%" }}>
                    <BenefitsChart />
                    <Box mt={2} textAlign="center">
                      <Link to="/reports/benefits" style={{ textDecoration: "none" }}>
                        مشاهده جزئیات گزارش فواید
                      </Link>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ px: 2, py: 2, height: "100%" }}>
                    <SalesChart />
                    <Box mt={2} textAlign="center">
                      <Link to="/reports/sales-table" style={{ textDecoration: "none" }}>
                        جزئیات بشتر فروش
                      </Link>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </ContentBox>
      </Fragment>
    </MainLayoutjur>
  );
}
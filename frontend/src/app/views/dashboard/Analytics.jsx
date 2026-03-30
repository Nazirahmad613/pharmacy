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
        <LanguageSwitcher />

        <ContentBox className="analytics">
          <Grid container spacing={3}>
            
            {/* ستون سمت چپ */}
            <Grid item md={7} xs={12}>
              
              {/* نمودار روزانه */}
              <Card
                sx={{
                  maxHeight: 400,
                  overflow: 'auto',
                  px: 3,
                  py: 2,
                  mb: 1,
                  width: '91%',
                }}
              >
                <DashboardDailyChart />
                <Box mt={2} textAlign="center">
                  <Link 
                    to="/reports/DashboardDailyTable" 
                    style={{ 
                      textDecoration: "none",
                      color: "#0b3d5f",
                      fontWeight: 500,
                      fontSize: "0.875rem"
                    }}
                  >
                    مشاهده جزئیات گزارش روزانه
                  </Link>
                </Box>
              </Card>

            {/* ردیف اصلاح‌شده: فواید + فروش (فروش در سمت چپ) */}
<Grid container spacing={2} sx={{ mb: 1 }}>
  {/* نمودار فواید (عرض بیشتر) */}
  <Grid item xs={12} md={10}>
    <Card sx={{ px: 3, py: 2, height: '100%',width:'110%' }}>
      <BenefitsChart />
      <Box mt={2} textAlign="center">
        <Link 
          to="/reports/BenefitsReport" 
          style={{ 
            textDecoration: "none",
            color: "#0b3d5f",
            fontWeight: 400,
            fontSize: "0.875rem"
          }}
        >
          مشاهده جزئیات گزارش فواید
        </Link>
      </Box>
    </Card>
  </Grid>

  {/* جدول فروش (عرض کمتر، در سمت چپ قرار می‌گیرد) */}
  <Grid item xs={12} md={2}>
    <Card sx={{ px: 3, py: 3, height: '100%', maxHeight: 400,width:'600%',marginLeft:'50%' }}>
      <SalesChart />
    </Card>
  </Grid>
</Grid>
            </Grid>

            {/* ستون سمت راست */}
            <Grid item md={5} xs={12}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 400,
                  px: 3,
                  py: 2,
                  mb: 3,
                  width: '125%',
                  marginLeft:'-15%'
                 
                }}
              >
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <MedicationStockChart />
                </Box>

                <Box mt={2} textAlign="center">
                  <Link to="/reports/MedicationStockTable" style={{ textDecoration: "none" }}>
                    <Button variant="outlined" color="primary" size="small">
                      دیدن جزئیات
                    </Button>
                  </Link>
                </Box>
              </Card>
            </Grid>

          </Grid>
        </ContentBox>
      </Fragment>
    </MainLayoutjur>
  );
}
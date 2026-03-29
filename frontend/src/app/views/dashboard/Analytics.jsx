import { Fragment } from "react";
import { useTranslation } from 'react-i18next'; 
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { styled, useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography"; // added for styling link

import MainLayoutjur from "../../../components/Mainlayoutjur";
import MedicationStockChart from "../material-kit/reports/medication-stock/MedicationStockChart";
import SalesTable from "../material-kit/reports/sales/SalesTable";
import DashboardDailyChart from "../material-kit/reports/dashboard/DashboardDailyChart";

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
            {/* Left column */}
            <Grid item md={8} xs={12}>
              {/* Daily chart card with link at bottom */}
              <Card
                sx={{
                  maxHeight:400,
                  overflow: 'auto',
                  px: 3,
                  py: 2,
                  mb: 3,
                  ml: 'auto',
                  width: '100%',
                 
                }}
              >
                <DashboardDailyChart />
                <Box mt={2} textAlign="center">
                  <Link 
                    to="/reports/DashboardDailyTable" 
                    style={{ 
                      textDecoration: "none",
                      color: "#0b3d5f", // dark blue
                      fontWeight: 500,
                      fontSize: "0.875rem"
                    }}
                  >
                    مشاهده جزئیات گزارش روزانه
                  </Link>
                </Box>
              </Card>

              {/* Sales table */}
              <SalesTable />
            </Grid>

            {/* Right column */}
            <Grid item md={4} xs={12}>
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
            </Grid>
          </Grid>
        </ContentBox>
      </Fragment>
    </MainLayoutjur>
  );
}
import React from "react";
import { Box, Typography } from "@mui/material";

const DashboardDailyChart = ({ rawData = [] }) => {
  // نمایش نوع داده برای دیباگ
  console.log("DashboardDailyChart received:", typeof rawData, rawData);
  
  // اگر rawData آرایه نیست، آرایه خالی در نظر بگیر
  const dataArray = Array.isArray(rawData) ? rawData : [];
  
  if (dataArray.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <Typography color="textSecondary">
          داده‌ای برای نمایش وجود ندارد (نوع داده: {typeof rawData})
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <pre>
        {JSON.stringify(dataArray, null, 2)}
      </pre>
    </Box>
  );
};

export default DashboardDailyChart;
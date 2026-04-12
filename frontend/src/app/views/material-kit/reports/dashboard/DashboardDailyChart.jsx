import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { Line } from "react-chartjs-2";

const DashboardDailyChart = ({ rawData = [] }) => {
  // ایمن‌سازی داده ورودی
  const safeData = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if (rawData.data && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, [rawData]);

  const chartData = useMemo(() => {
    if (!safeData.length) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = safeData.map(item => item?.date || "");
    const values = safeData.map(item => item?.value || 0);

    return {
      labels,
      datasets: [
        {
          label: "آمار روزانه",
          data: values,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1
        }
      ]
    };
  }, [safeData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  if (!safeData.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <Typography color="textSecondary">
          داده‌ای برای نمایش وجود ندارد
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default DashboardDailyChart;
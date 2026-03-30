import { useEffect, useState, useMemo } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { Bar } from "react-chartjs-2";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardDailyChart() {
  const { api, user, loading: authLoading } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exclusiveDatasetIndex, setExclusiveDatasetIndex] = useState(null); // null = all datasets visible

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/dashboard-daily");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load chart data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, api]);

  const chartData = useMemo(() => {
    if (!data.length) return null;

    const datasets = [
      {
        label: "مریضان",
        data: data.map((d) => d.total_patients),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "نسخه‌ها",
        data: data.map((d) => d.total_prescriptions),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "فروش",
        data: data.map((d) => d.total_sales),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ];

    // Apply exclusive visibility
    if (exclusiveDatasetIndex !== null) {
      datasets.forEach((ds, idx) => {
        ds.hidden = idx !== exclusiveDatasetIndex;
      });
    }

    return {
      labels: data.map((d) => d.report_date),
      datasets,
    };
  }, [data, exclusiveDatasetIndex]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()}`,
          },
        },
        legend: {
          position: "top",
          onClick: (e, legendItem, legend) => {
            // Prevent default toggle behavior
            const index = legendItem.datasetIndex;
            if (index === undefined) return;

            // Toggle exclusive: if already selected, show all; else show only this dataset
            setExclusiveDatasetIndex((prev) => (prev === index ? null : index));
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    }),
    []
  );

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress aria-label="Loading chart data" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="info">Please log in to view the dashboard.</Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!chartData) {
    return (
      <Box p={3}>
        <Typography variant="body1" textAlign="center">
          No data available for the selected period.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" textAlign="center" gutterBottom>
        گزارش گرافیکی وضعیت روزانه شفاخانه
      </Typography>
      <Bar data={chartData} options={chartOptions} aria-label="Daily sales and patients chart" />
    </Box>
  );
}
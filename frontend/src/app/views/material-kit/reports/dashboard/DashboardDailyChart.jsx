import { useEffect, useState, useMemo } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { Bar } from "react-chartjs-2";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

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

  const [rawData, setRawData] = useState([]);       // داده‌های خام روزانه از API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exclusiveDatasetIndex, setExclusiveDatasetIndex] = useState(null);

  // State فیلترها
  const [period, setPeriod] = useState("daily");    // "daily", "monthly", "yearly"
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // دریافت داده‌های خام (فقط یک بار)
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/dashboard-daily");
        setRawData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load chart data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, api]);

  // تابع کمکی برای گروه‌بندی داده‌ها بر اساس بازه
  const aggregateData = useMemo(() => {
    if (!rawData.length) return [];

    if (period === "daily") {
      // نمایش تمام روزها (بدون تغییر)
      return rawData.map((item) => ({
        label: item.report_date,
        patients: item.total_patients,
        prescriptions: item.total_prescriptions,
        sales: item.total_sales,
      }));
    }

    if (period === "monthly") {
      // گروه‌بندی بر اساس سال و ماه
      const monthlyMap = new Map();
      rawData.forEach((item) => {
        const date = new Date(item.report_date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        if (year !== selectedYear) return; // فقط سال انتخاب شده
        const key = `${year}-${month}`;
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, {
            label: `${year}/${month}`,
            patients: 0,
            prescriptions: 0,
            sales: 0,
          });
        }
        const acc = monthlyMap.get(key);
        acc.patients += item.total_patients;
        acc.prescriptions += item.total_prescriptions;
        acc.sales += item.total_sales;
      });
      return Array.from(monthlyMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    }

    if (period === "yearly") {
      // گروه‌بندی بر اساس سال
      const yearlyMap = new Map();
      rawData.forEach((item) => {
        const year = new Date(item.report_date).getFullYear();
        if (!yearlyMap.has(year)) {
          yearlyMap.set(year, {
            label: year.toString(),
            patients: 0,
            prescriptions: 0,
            sales: 0,
          });
        }
        const acc = yearlyMap.get(year);
        acc.patients += item.total_patients;
        acc.prescriptions += item.total_prescriptions;
        acc.sales += item.total_sales;
      });
      return Array.from(yearlyMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    }

    return [];
  }, [rawData, period, selectedYear]);

  // ساخت دیتاست برای نمودار از داده‌های تجمیع شده
  const chartData = useMemo(() => {
    if (!aggregateData.length) return null;

    const datasets = [
      {
        label: "مریضان",
        data: aggregateData.map((d) => d.patients),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "نسخه‌ها",
        data: aggregateData.map((d) => d.prescriptions),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "فروش",
        data: aggregateData.map((d) => d.sales),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ];

    if (exclusiveDatasetIndex !== null) {
      datasets.forEach((ds, idx) => {
        ds.hidden = idx !== exclusiveDatasetIndex;
      });
    }

    return {
      labels: aggregateData.map((d) => d.label),
      datasets,
    };
  }, [aggregateData, exclusiveDatasetIndex]);

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
          onClick: (e, legendItem) => {
            const index = legendItem.datasetIndex;
            if (index === undefined) return;
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
        گزارش گرافیکی وضعیت  شفاخانه
      </Typography>

      {/* فیلترها */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap" justifyContent="center">
        <FormControl size="small" style={{ minWidth: 120 }}>
          <InputLabel>نوع گزارش</InputLabel>
          <Select value={period} label="نوع گزارش" onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="daily">روزانه</MenuItem>
            <MenuItem value="monthly">ماهانه</MenuItem>
            <MenuItem value="yearly">سالانه</MenuItem>
          </Select>
        </FormControl>

        {period === "monthly" && (
          <TextField
            type="number"
            label="سال"
            size="small"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
            style={{ width: 100 }}
          />
        )}

        {period === "yearly" && (
          // برای سالانه نیازی به انتخاب اضافه نیست، همه سالها نمایش داده می‌شود
          <Typography variant="body2" color="textSecondary" sx={{ alignSelf: "center" }}>
            (نمایش همه سال‌ها)
          </Typography>
        )}
      </Box>

      <Bar data={chartData} options={chartOptions} aria-label="Daily sales and patients chart" />
    </Box>
  );
}
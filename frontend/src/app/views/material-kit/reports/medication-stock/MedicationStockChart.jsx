import { useEffect, useState } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { Pie } from "react-chartjs-2";
import { Box, Typography, CircularProgress } from "@mui/material";
import MainLayoutjur from "../../../../../components/Mainlayoutjur";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// تابع برای تولید رنگ بر اساس وضعیت موجودی
const getStatusColor = (status) => {
  switch (status) {
    case "LOW":
      return "#FF6384"; // قرمز
    case "MEDIUM":
      return "#FFCE56"; // زرد/نارنجی
    case "HIGH":
      return "#36A2EB"; // سبز
    default:
      return "#C9CBCF";
  }
};

export default function MedicationStockChart() {
  const { api, user, loading: authLoading } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setError("❌ لطفاً ابتدا وارد سیستم شوید");
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await api.get("/reports/medication-stock");
        setData(res.data || []);
      } catch (err) {
        console.error(err);
        setError("خطا در دریافت داده‌ها");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, user, authLoading]);

  if (authLoading) {
    return <CircularProgress />;
  }

  // ===== داده‌های نمودار دایره‌ای (هر دارو به‌عنوان یک بخش) =====
  const pieLabels = data.map(d => d.medication_name);
  const pieDataValues = data.map(d => d.available_stock);
  const pieBackgroundColors = data.map(d => getStatusColor(d.stock_status));

  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieDataValues,
        backgroundColor: pieBackgroundColors,
        borderColor: "#fff",
        borderWidth: 2,
      }
    ]
  };

  // تنظیمات tooltip برای نمایش وضعیت
  const pieOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw;
            const status = data[context.dataIndex]?.stock_status || "نامشخص";
            return `${label}: ${value} (وضعیت: ${status})`;
          }
        }
      }
    }
  };

  return (
    <MainLayoutjur>
      <Box p={3}>
        <Typography variant="h4" textAlign="center" marginBottom={3}>
        دوا های موجودی
        </Typography>

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={5}>
            <Box width="100%" maxWidth="500px">
              <Typography variant="h6" textAlign="center">
     چارت دایره‌ای موجودی دواها (با رنگ‌بندی وضعیت)
              </Typography>
              <Pie data={pieData} options={pieOptions} />
              <Typography variant="caption" display="block" textAlign="center" mt={1}>
                🔴 کم &nbsp;&nbsp; 🟡 متوسط &nbsp;&nbsp; 🔵 زیاد
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </MainLayoutjur>
  );
}
// فایل: src/components/reports/medication-stock/CompactMedicationStockChart.jsx
import { useEffect, useState } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { Pie } from "react-chartjs-2";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const getStatusColor = (status) => {
  switch (status) {
    case "LOW": return "#FF6384";   // قرمز
    case "MEDIUM": return "#FFCE56"; // زرد
    case "HIGH": return "#36A2EB";  // سبز
    default: return "#C9CBCF";
  }
};

export default function CompactMedicationStockChart() {
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

  if (authLoading || loading) return <CircularProgress size={40} />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data.length) return <Typography>داده‌ای موجود نیست</Typography>;

  const pieLabels = data.map(d => d.medication_name);
  const pieDataValues = data.map(d => d.available_stock);
  const pieBackgroundColors = data.map(d => getStatusColor(d.stock_status));

  const pieData = {
    labels: pieLabels,
    datasets: [{
      data: pieDataValues,
      backgroundColor: pieBackgroundColors,
      borderColor: "#fff",
      borderWidth: 1,
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
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
      },
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, font: { size: 10 } }
      }
    }
  };

  return (
    <Box sx={{ p: 1, textAlign: "center" }}>
      <Typography variant="subtitle1" gutterBottom>
       دواهای موجود
      </Typography>
      <Box sx={{ maxWidth: 250, mx: "auto", my: 1 }}>
        <Pie data={pieData} options={pieOptions} />
      </Box>
      <Typography variant="caption" display="block">
        🔴 کم &nbsp;&nbsp; 🟡 متوسط &nbsp;&nbsp; 🔵 زیاد
      </Typography>
    </Box>
  );
}
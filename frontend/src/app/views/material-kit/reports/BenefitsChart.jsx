import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import api from "../../../../api";

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function BenefitsChart() {
  const [type, setType] = useState("monthly");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await api.get("/benefits", {
        params: { type, month, year }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData();
  };

  // آماده‌سازی دیتا برای گراف
  const labels = data.map((item) =>
    type === "yearly"
      ? item.year
      : type === "monthly"
      ? item.month
      : item.journal_date
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "درآمد",
        data: data.map((item) => item.total_credit),
        backgroundColor: "rgba(54, 162, 235, 0.6)", // آبی
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "مصارف",
        data: data.map((item) => item.total_debit),
        backgroundColor: "rgba(255, 99, 132, 0.6)", // قرمز
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "سود خالص",
        data: data.map((item) => item.net_benefit),
        backgroundColor: "rgba(75, 192, 192, 0.6)", // سبز-آبی
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      }
    ]
  };

  // گزینه‌های مشترک برای هر دو نمودار (کوچک‌سازی و زیباسازی)
  const options = {
    responsive: true,
    maintainAspectRatio: false, // اجازه می‌دهد ارتفاع و عرض مستقل تنظیم شود
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()}`
        }
      }
    }
  };

  return (
    <Box p={3}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="نوع گزارش"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="daily">روزانه</MenuItem>
              <MenuItem value="monthly">ماهانه</MenuItem>
              <MenuItem value="yearly">سالانه</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label="ماه"
              fullWidth
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label="سال"
              fullWidth
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button variant="contained" fullWidth onClick={handleSearch}>
              نمایش
            </Button>
          </Grid>
        </Grid>
      </Card>

    
  
<Grid container spacing={2} sx={{ mt: 3 }}>
  {/* نمودار میله‌ای */}
  <Grid item xs={12} md={6}>
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        نمودار فواید (میله‌ای)
      </Typography>
      <Box sx={{ height: 300, width: '100%' }}>
        <Bar data={chartData} options={options} />
      </Box>
    </Card>
  </Grid>

  {/* نمودار خطی */}
  <Grid item xs={12} md={6}>
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        نمودار روند سود (خطی)
      </Typography>
      <Box sx={{ height: 300, width: '100%' }}>
        <Line data={chartData} options={options} />
      </Box>
    </Card>
  </Grid>
</Grid>
    
    </Box>
  );
}
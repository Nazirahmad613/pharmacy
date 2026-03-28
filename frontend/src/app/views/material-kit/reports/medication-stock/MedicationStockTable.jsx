import { useEffect, useState } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { Box, Typography, CircularProgress } from "@mui/material";
import MainLayoutjur from "../../../../../components/Mainlayoutjur";
import { ForkRight } from "@mui/icons-material";

export default function MedicationStockTable() {
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
      setError("");

      try {
        const res = await api.get("/reports/medication-stock");

        let apiData = [];

        if (Array.isArray(res.data)) {
          apiData = res.data;
        }

        if (!apiData.length) {
          setError("هیچ داده‌ای یافت نشد");
        }

        setData(apiData);
      } catch (err) {
        console.error(err);
        setError("خطا در دریافت داده‌ها");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, user, authLoading]);

  // ===== Loading user =====
  if (authLoading) {
    return (
      <Box textAlign="center">
        <CircularProgress />
        <Typography>در حال بررسی کاربر...</Typography>
      </Box>
    );
  }

  return (
    <MainLayoutjur>
    <Box p={3}>
     <Typography variant="h4" textAlign="center">
  گزارش  موجودیت دوا
</Typography>

      {/* Loading */}
      {loading && <CircularProgress />}

      {/* Error */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Table */}
      {!loading && !error && (
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>نام دوا</th>
              <th>خرید</th>
              <th>فروش</th>
              <th>موجودی</th>
              <th>وضعیت</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.medication_name}</td>
                <td>{item.total_purchased}</td>
                <td>{item.total_sold}</td>
                <td>{item.available_stock}</td>
                <td>{item.stock_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Box>
    </MainLayoutjur>
  );
}
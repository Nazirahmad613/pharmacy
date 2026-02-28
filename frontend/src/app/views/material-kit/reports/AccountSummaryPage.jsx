import { useState, useEffect } from "react";
import { useAuth } from "app/contexts/AuthContext";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";

export default function AccountSummaryText() {
  const { api, user, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ===== دریافت داده‌ها از API =====
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setError("❌ ابتدا وارد سیستم شوید تا حساب‌ها نمایش داده شوند");
      setData([]);
      setFilteredData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/account-summary");

        let apiData = [];
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          apiData = res.data.data;
        } else if (Array.isArray(res.data)) {
          apiData = res.data;
        }

        if (!apiData.length) setError("هیچ حسابی یافت نشد");

        setData(apiData);
        setFilteredData(apiData);
        setCurrentPage(1); // reset page
      } catch (err) {
        console.error("خطا در دریافت حساب‌ها:", err);
        setError("خطا در دریافت داده‌ها. لطفاً API و توکن را بررسی کنید.");
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, user, authLoading]);

  // ===== فیلتر و جستجو =====
  useEffect(() => {
    let temp = [...data];
    if (filterType) temp = temp.filter((item) => item.account_type === filterType);
    if (search)
      temp = temp.filter((item) =>
        item.account_name.toLowerCase().includes(search.toLowerCase())
      );

    temp.sort((a, b) => {
      if (a.account_type < b.account_type) return -1;
      if (a.account_type > b.account_type) return 1;
      if (a.account_name < b.account_name) return -1;
      if (a.account_name > b.account_name) return 1;
      return 0;
    });

    setFilteredData(temp);
    setCurrentPage(1); // reset page on filter/search
  }, [search, filterType, data]);

  // محاسبه آیتم‌های صفحه فعلی
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // ===== Loading هنگام بارگذاری Auth =====
  if (authLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography>در حال بارگذاری اطلاعات کاربر...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, direction: "rtl" }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        گزارش حساب‌ها
      </Typography>

      {/* جستجو و فیلتر */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="جستجوی نام حساب"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>فیلتر نوع حساب</InputLabel>
          <Select
            value={filterType}
            label="فیلتر نوع حساب"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="">همه</MenuItem>
            <MenuItem value="doctor">داکتر</MenuItem>
            <MenuItem value="patient">مریض</MenuItem>
            <MenuItem value="customer">مشتری</MenuItem>
            <MenuItem value="supplier">حمایت‌کننده</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Loading API */}
      {loading && (
        <Box sx={{ textAlign: "center", my: 3 }}>
          <CircularProgress />
          <Typography>در حال بارگذاری داده‌ها...</Typography>
        </Box>
      )}

      {/* نمایش خطا */}
      {!loading && error && (
        <Typography sx={{ textAlign: "center", mt: 3, color: "red" }}>
          {error}
        </Typography>
      )}

      {/* کارت‌های هر حساب در یک Row جدا */}
      {!loading && !error && currentItems.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {currentItems.map((item) => (
            <Box
              key={`${item.account_type}_${item.account_id}`}
              sx={{
                display: "flex",
                flexDirection: "row", // افقی هر کارت
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 2,
                backgroundColor: "#f9f9f9",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h6" sx={{ minWidth: 150 }}>
                {item.account_name}
              </Typography>
              <Typography sx={{ minWidth: 120 }}>
                نوع حساب: <strong>{item.account_type}</strong>
              </Typography>
                مجموع حساب <strong>{Number(item.total_credit || 0).toLocaleString()}</strong>
              <Typography sx={{ minWidth: 120 }}>
              مجموعه پرداخت شده <strong>{Number(item.total_debit || 0).toLocaleString()}</strong>
              </Typography>
              <Typography sx={{ minWidth: 120 }}>
              </Typography>
              <Typography sx={{ minWidth: 120 }}>
           مجموعه باقی مانده <strong>{Number(item.balance || 0).toLocaleString()}</strong>
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Pagination Controls */}
      {!loading && !error && filteredData.length > itemsPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            قبلی
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "contained" : "outlined"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="contained"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            بعدی
          </Button>
        </Box>
      )}

      {!loading && !error && filteredData.length === 0 && (
        <Typography sx={{ textAlign: "center", mt: 3 }}>
          هیچ حسابی یافت نشد
        </Typography>
      )}
    </Box>
  );
}
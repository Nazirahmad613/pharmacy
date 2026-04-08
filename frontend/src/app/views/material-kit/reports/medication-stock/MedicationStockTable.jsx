import { useEffect, useState, useMemo } from "react";
import { useAuth } from "app/contexts/AuthContext";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";
import MainLayoutjur from "../../../../../components/Mainlayoutjur";

export default function MedicationStockTable() {
  const { api, user, loading: authLoading } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Search by medication name
    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.medication_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by stock status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.stock_status === statusFilter);
    }

    return filtered;
  }, [data, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

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
        <Typography variant="h4" textAlign="center" gutterBottom>
          گزارش موجودیت دوا
        </Typography>

        {/* Filters & Search */}
        <Box display="flex" gap={2} flexWrap="wrap" mb={3} alignItems="flex-end">
          <TextField
            label="جستجو بر اساس نام دوا"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="مثلاً استامینوفن"
            margin="normal"
            sx={{
              "& .MuiInputLabel-root": {
                color: "#fff", // label white
              },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff", // input box white
                "& fieldset": {
                  borderColor: "rgba(0,0,0,0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "#000",
                },
                "& input": {
                  color: "#000", // input text black
                },
              },
            }}
          />

          <FormControl size="small" margin="normal" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: "#fff" }}>وضعیت موجودی</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="وضعیت موجودی"
              sx={{
                backgroundColor: "#fff",
                color: "#000",
                "& .MuiSelect-icon": {
                  color: "#000",
                },
              }}
            >
              <MenuItem value="all">همه</MenuItem>
              <MenuItem value="خوب">خوب</MenuItem>
              <MenuItem value="کم">کم</MenuItem>
              <MenuItem value="تمام شده">تمام شده</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Loading */}
        {loading && <CircularProgress />}

        {/* Error */}
        {error && <Typography color="error">{error}</Typography>}

        {/* Table */}
        {!loading && !error && (
          <>
            <table
              border="1"
              width="100%"
              style={{ borderCollapse: "collapse", marginTop: "1rem" }}
            >
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
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} align="center">
                      هیچ داده‌ای یافت نشد
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.medication_name}</td>
                      <td>{item.total_purchased}</td>
                      <td>{item.total_sold}</td>
                      <td>{item.available_stock}</td>
                      <td>{item.stock_status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "#fff",
                    },
                    "& .MuiPaginationItem-page.Mui-selected": {
                      backgroundColor: "#1976d2",
                      color: "#fff",
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </MainLayoutjur>
  );
}
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "app/contexts/AuthContext";
import ReportLayout from "../../../../../components/ReportLayout";
import {
  Box,
  Card,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Typography,
  CircularProgress,
} from "@mui/material";

export default function MedicationStockTable() {
  const { api, user, loading: authLoading } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination (using TablePagination style)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
        let apiData = Array.isArray(res.data) ? res.data : [];
        if (!apiData.length) setError("هیچ داده‌ای یافت نشد");
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
    setPage(0);
  }, [searchTerm, statusFilter]);

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.medication_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.stock_status === statusFilter);
    }

    return filtered;
  }, [data, searchTerm, statusFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPage(0);
  };

  if (authLoading || loading) {
    return (
      <ReportLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
          <Typography mr={1}>در حال بارگذاری...</Typography>
        </Box>
      </ReportLayout>
    );
  }

  if (error) {
    return (
      <ReportLayout>
        <Typography color="error" textAlign="center" p={3}>
          {error}
        </Typography>
      </ReportLayout>
    );
  }

  return (
    <ReportLayout>
      <Box p={3}>
        <Typography variant="h4" textAlign="center" gutterBottom>
          گزارش موجودیت دوا
        </Typography>

        {/* Filter Card */}
        <Card sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="جستجو بر اساس نام دوا"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="مثلاً استامینوفن"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="medium">
                <InputLabel>وضعیت موجودی</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت موجودی"
                >
                  <MenuItem value="all">همه</MenuItem>
                  <MenuItem value="خوب">خوب</MenuItem>
                  <MenuItem value="کم">کم</MenuItem>
                  <MenuItem value="تمام شده">تمام شده</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="outlined" fullWidth onClick={handleClearFilters}>
                پاک کردن
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Table Card */}
        <Card sx={{ mt: 3 }}>
          {filteredData.length === 0 ? (
            <Typography align="center" p={3}>
              داده‌ای موجود نیست ❗
            </Typography>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>نام دوا</TableCell>
                    <TableCell>خرید</TableCell>
                    <TableCell>فروش</TableCell>
                    <TableCell>موجودی</TableCell>
                    <TableCell>وضعیت</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.medication_name}</TableCell>
                        <TableCell>{item.total_purchased}</TableCell>
                        <TableCell>{item.total_sold}</TableCell>
                        <TableCell>{item.available_stock}</TableCell>
                        <TableCell>{item.stock_status}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) =>
                  setRowsPerPage(parseInt(e.target.value, 10))
                }
                labelRowsPerPage="ردیف در صفحه:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} از ${count}`
                }
              />
            </>
          )}
        </Card>
      </Box>
    </ReportLayout>
  );
}
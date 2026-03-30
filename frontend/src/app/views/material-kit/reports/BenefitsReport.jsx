import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Typography
} from "@mui/material";
import axios from "axios";
import MainLayoutjur from "../../../../components/Mainlayoutjur";

export default function BenefitsReport() {
  const [type, setType] = useState("daily");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [data, setData] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ گرفتن توکن
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/benefits", {
        params: { type, date, month, year },
        headers: {
          Authorization: `Bearer ${token}`, // ✅ مهم‌ترین بخش
          Accept: "application/json"
        }
      });

      console.log("DATA:", res.data); // 🔍 برای دیباگ
      setData(res.data);
    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      console.warn("توکن یافت نشد ❌");
    }
  }, []);

  const handleSearch = () => {
    fetchData();
  };

  return ( <MainLayoutjur>
    <Box p={3}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* نوع گزارش */}
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

          {/* فیلترها */}
          {type === "daily" && (
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Grid>
          )}

          {type === "monthly" && (
            <>
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
            </>
          )}

          {type === "yearly" && (
            <Grid item xs={12} md={3}>
              <TextField
                label="سال"
                fullWidth
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </Grid>
          )}

          <Grid item xs={12} md={2}>
            <Button variant="contained" fullWidth onClick={handleSearch}>
              جستجو
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* جدول */}
      <Card sx={{ mt: 3 }}>
        {data.length === 0 ? (
          <Typography align="center" p={3}>
            داده‌ای موجود نیست ❗
          </Typography>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>تاریخ</TableCell>
                  <TableCell>سال</TableCell>
                  <TableCell>ماه</TableCell>
                  <TableCell>درآمد</TableCell>
                  <TableCell>مصارف</TableCell>
                  <TableCell>سود خالص</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.journal_date}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>{row.month}</TableCell>
                      <TableCell>{row.total_credit}</TableCell>
                      <TableCell>{row.total_debit}</TableCell>
                      <TableCell>{row.net_benefit}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={data.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) =>
                setRowsPerPage(parseInt(e.target.value, 10))
              }
            />
          </>
        )}
      </Card>
    </Box>
    </MainLayoutjur>
  );
}
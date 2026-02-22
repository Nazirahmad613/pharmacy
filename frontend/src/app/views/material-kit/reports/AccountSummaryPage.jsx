import { useState, useEffect } from "react";
import { TextField, MenuItem, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useAuth } from "app/contexts/AuthContext";

export default function AccountSummaryPage() {
  const { api } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [accountType, setAccountType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/account-summary", {
        params: {
          account_type: accountType || undefined,
          search: search || undefined,
          per_page: pageSize,
          page: page + 1,
        },
      });

      setRows(response.data.data ?? []);
      setRowCount(response.data.total ?? response.data.length ?? 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [accountType, search, page, pageSize]);

  // ================= COLUMNS =================
  const columns = [
    {
      field: "account_type",
      headerName: "نوع حساب",
      flex: 1,
      headerAlign: "right",
      align: "right",
      valueFormatter: (params) => {
        const map = {
          doctor: "داکتر",
          patient: "مریض",
          customer: "مشتری",
          supplier: "حمایت‌کننده",
          visitor: "مراجع",
          staff: "کارمند",
          rent: "کرایه",
          electricity: "برق",
          water: "آب",
          internet: "انترنت",
          salary: "معاش",
          fuel: "سوخت",
          maintenance: "ترمیمات",
          laboratory: "لابراتوار",
          transport: "ترانسپورت",
          consultation: "مشاوره",
          expense: "مصرف عمومی",
          income: "درآمد",
          other: "سایر",
        };
        return map[params.value] || params.value;
      },
    },
    {
      field: "account_name",
      headerName: "نام حساب",
      flex: 1.5,
      headerAlign: "right",
      align: "right",
    },
    {
      field: "total_credit",
      headerName: "مجموعه کل ",
      flex: 1,
      type: "number",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "total_debit",
      headerName: "پرداخت شده ",
      flex: 1,
      type: "number",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "balance",
      headerName: "باقی‌مانده",
      flex: 1,
      type: "number",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span style={{ color: params.value > 0 ? "red" : "green" }}>
          {params.value}
        </span>
      ),
    },
  ];

  return (
    <Box p={2}>
      {/* فیلترها */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          select
          label="نوع حساب"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          style={{ minWidth: 200 }}
        >
          <MenuItem value="">همه</MenuItem>
          <MenuItem value="doctor">داکتر</MenuItem>
          <MenuItem value="patient">مریض</MenuItem>
          <MenuItem value="customer">مشتری</MenuItem>
          <MenuItem value="supplier">حمایت‌کننده</MenuItem>
        </TextField>

        <TextField
          label="جستجو"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 200 }}
        />
      </Box>

      {/* جدول */}
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.account_type + "_" + row.account_id}
        loading={loading}
        autoHeight
        pagination
        paginationMode="server"
        rowCount={rowCount}
        page={page}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
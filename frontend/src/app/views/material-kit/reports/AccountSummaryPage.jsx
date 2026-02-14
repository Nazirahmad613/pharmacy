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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [accountType, search, fromDate, toDate, page, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/account-summary", {
        params: {
          account_type: accountType,
          search: search,
          from_date: fromDate,
          to_date: toDate,
          per_page: pageSize,
          page: page + 1
        }
      });

      setRows(response.data.data);
      setRowCount(response.data.total);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const columns = [
    { field: "account_type", headerName: "نوع حساب", flex: 1 },
    { field: "account_name", headerName: "نام", flex: 1.5 },
    { field: "last_date", headerName: "آخرین تاریخ", flex: 1 },
    { field: "medications", headerName: "دواها", flex: 2 },
    { field: "total_quantity", headerName: "مجموع تعداد", flex: 1 },
    { field: "total_amount", headerName: "مجموع مبلغ", flex: 1 },
    { field: "total_paid", headerName: "پرداخت شده", flex: 1 },
    {
      field: "total_due",
      headerName: "باقی مانده",
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: params.value > 0 ? "red" : "green" }}>
          {params.value}
        </span>
      )
    }
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
          <MenuItem value="sales">فروش</MenuItem>
          <MenuItem value="purchase">خرید</MenuItem>
          <MenuItem value="prescription">نسخه</MenuItem>
        </TextField>

        <TextField
          label="جستجو"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TextField
          type="date"
          label="از تاریخ"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <TextField
          type="date"
          label="تا تاریخ"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
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

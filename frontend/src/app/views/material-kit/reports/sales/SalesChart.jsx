import { useEffect, useState, useRef } from "react";
import { useAuth } from "app/contexts/AuthContext";
import MainLayoutjur from "../../../../../components/Mainlayoutjur";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesTable() {
  const { api, user, loading: authLoading } = useAuth();

  const [data, setData] = useState([]);
  const [type, setType] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Wait for auth to finish loading and ensure user is logged in
    if (authLoading) return;
    if (!user) return;

    // Ensure api is available
    if (!api) {
      setError("خطا در اتصال به سرور");
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      setData([]); // Clear old data while fetching

      try {
        const res = await api.get(`/sales-report?type=${type}`, {
          signal: controller.signal,
        });

        // Ensure response data is an array
        const responseData = Array.isArray(res.data) ? res.data : [];
        setData(responseData);

        if (responseData.length === 0) {
          // No data is not an error, just empty state
          // We don't set an error here
        }
      } catch (err) {
        // Ignore aborted requests
        if (err.name === "AbortError") {
          return;
        }
        console.error("Sales report error:", err);
        setError("خطا در دریافت گزارش فروش");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [type, user, authLoading, api]); // Keep user and api in dependencies

  // Handle authentication loading state
  if (authLoading) {
    return <div>در حال بررسی کاربر...</div>;
  }

  // Handle missing user (not logged in)
  if (!user) {
    return <div>لطفاً وارد شوید.</div>;
  }

  // Handle missing API client
  if (!api) {
    return <div>مشکل در ارتباط با سرور. لطفاً دوباره تلاش کنید.</div>;
  }

  // Prepare data for chart
  const chartData = data.map((item) => ({
    date: item.label,
    sales: item.total_sales,
    orders: item.total_orders,
  }));

  return (
    <MainLayoutjur>
      <div>
        <h2>گزارش فروش</h2>

        <label htmlFor="report-type">نوع گزارش:</label>
        <select
          id="report-type"
          onChange={(e) => setType(e.target.value)}
          value={type}
          disabled={loading}
        >
          <option value="daily">روزانه</option>
          <option value="weekly">هفتگی</option>
          <option value="monthly">ماهانه</option>
          <option value="yearly">سالانه</option>
        </select>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading && <p>در حال بارگذاری...</p>}

        {!loading && data.length === 0 && !error && (
          <p>هیچ داده‌ای یافت نشد.</p>
        )}

        {!loading && data.length > 0 && (
          <>
            {/* نمودار خطی */}
            <div style={{ margin: "2rem 0", height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* جدول داده‌ها */}
            <table className="sales-table" border={1} width="100%">
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>مجموع فروش</th>
                  <th>تعداد سفارش</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id || item.label || index}>
                    <td>{item.label || "-"}</td>
                    <td>{item.total_sales ?? 0}</td>
                    <td>{item.total_orders ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </MainLayoutjur>
  );
}
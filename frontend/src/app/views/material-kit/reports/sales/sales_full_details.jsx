import { useEffect, useState } from "react";
import api from "../../../../../api"; // مسیر API شما

export default function SalesReport() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ total_sales: 0, total_paid: 0, remaining: 0 });
  const [loading, setLoading] = useState(false);

  // ===== فیلترها =====
  const [filters, setFilters] = useState({
    cust_name: "",
    gen_name: "",
    category_name: "",
    payment_status: "",
    from_date: "",
    to_date: "",
    sort_by: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // ===== دریافت داده‌ها =====
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get("/salesd", { params: filters });

      const salesData = Array.isArray(res.data.data) ? res.data.data : [];
      setData(salesData);

      const summaryData = res.data.summary || { total_sales: 0, total_paid: 0, remaining: 0 };
      setSummary(summaryData);
    } catch (e) {
      console.error("Sales fetch error:", e);
      alert("خطا در دریافت گزارش فروش");
    } finally {
      setLoading(false);
    }
  };

  // ===== بارگذاری اولیه =====
  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <>
      <h3>📊 گزارش جامع فروش داروها</h3>

      {/* ===== فیلترها ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 10 }}>
        <input name="cust_name" placeholder="مشتری" value={filters.cust_name} onChange={handleChange} />
        <input name="gen_name" placeholder="نام دوا" value={filters.gen_name} onChange={handleChange} />
        <input name="category_name" placeholder="کتگوری" value={filters.category_name} onChange={handleChange} />

        <select name="payment_status" value={filters.payment_status} onChange={handleChange}>
          <option value="">وضعیت پرداخت</option>
          <option value="پرداخت کامل شده">پرداخت کامل</option>
          <option value="پرداخت جزئی">پرداخت جزئی</option>
          <option value="پرداخت نشده">پرداخت نشده</option>
        </select>

        <input type="date" name="from_date" value={filters.from_date} onChange={handleChange} />
        <input type="date" name="to_date" value={filters.to_date} onChange={handleChange} />

        <select name="sort_by" value={filters.sort_by} onChange={handleChange}>
          <option value="">مرتب‌سازی</option>
          <option value="highest_sales">بیشترین فروش</option>
          <option value="highest_paid">بیشترین پرداخت</option>
          <option value="latest">جدیدترین</option>
        </select>

        <button onClick={fetchSales}>اعمال فیلتر</button>
      </div>

      {/* ===== خلاصه فروش ===== */}
      <div style={{ marginTop: 15, background: "#f5f5f5", padding: 10 }}>
        <strong>خلاصه فروش:</strong>
        <p>💰 مجموع فروش: {Number(summary.total_sales).toLocaleString()}</p>
        <p>✅ پرداخت‌شده: {Number(summary.total_paid).toLocaleString()}</p>
        <p>❗ باقی‌مانده: {Number(summary.remaining).toLocaleString()}</p>
      </div>

      {/* ===== جدول فروش ===== */}
      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : (
        <table border="1" width="100%" cellPadding="6" style={{ marginTop: 10, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>مشتری</th>
              <th>نام دوا</th>
              <th>کتگوری</th>
              <th>تعداد</th>
              <th>فی واحد</th>
              <th>مجموع</th>
              <th>پرداخت شده</th>
              <th>باقی‌مانده</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((r) => (
                <tr key={`${r.sales_id}-${r.med_id}`}>
                  <td>{r.sales_date}</td>
                  <td>{r.cust_name}</td>
                  <td>{r.gen_name}</td>
                  <td>{r.category_name}</td>
                  <td>{r.quantity}</td>
                  <td>{Number(r.unit_sales).toLocaleString()}</td>
                  <td>{Number(r.total_sales).toLocaleString()}</td>
                  <td>{Number(r.total_paid).toLocaleString()}</td>
                  <td>{Number(r.remaining_amount).toLocaleString()}</td>
                  <td>{r.payment_status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" align="center">داده‌ای یافت نشد</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
}

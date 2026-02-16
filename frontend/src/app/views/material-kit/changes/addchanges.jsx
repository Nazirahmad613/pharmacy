import { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";
import MainLayoutjur from "../../../../components/MainLayoutjur";

const ENTRY_TYPE_FA = {
  debit: "اخذ پول",
  credit: "پرداخت پول",
};

const REF_TYPE_FA = {
  sale: "فروش",
  parchase: "خرید",
  doctor: "داکتر",
  patient: "مریض",
  supplier: "حمایت‌کننده",
  customer: "مشتری",
};

export default function JournalPage() {
  const { api } = useAuth();

  const [journals, setJournals] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [transactions, setTransactions] = useState({ sale: [], parchase: [] });

  const [form, setForm] = useState({
    journal_date: "",
    description: "",
    entry_type: "debit",
    amount: "",
    ref_type: "",
    ref_id: "",
  });

  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const ROWS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      const [journalsRes, registrationsRes, salesRes, purchasesRes] =
        await Promise.allSettled([
          api.get("/journals", { params: { type: filterType || undefined } }),
          api.get("/registrations"),
          api.get("/sales"),
          api.get("/purchases"),
        ]);

      let journalsData = [];
      if (journalsRes.status === "fulfilled") {
        const data = Array.isArray(journalsRes.value.data?.data)
          ? journalsRes.value.data.data
          : Array.isArray(journalsRes.value.data)
          ? journalsRes.value.data
          : [];
        journalsData = [...data].reverse();
      }
      setJournals(journalsData);

      let regs = [];
      if (registrationsRes.status === "fulfilled") {
        const data = Array.isArray(registrationsRes.value.data?.data)
          ? registrationsRes.value.data.data
          : Array.isArray(registrationsRes.value.data)
          ? registrationsRes.value.data
          : [];
        regs = data;
      }
      setRegistrations(regs);

      let sales = [];
      if (salesRes.status === "fulfilled") {
        const data = Array.isArray(salesRes.value.data?.data)
          ? salesRes.value.data.data
          : Array.isArray(salesRes.value.data)
          ? salesRes.value.data
          : [];
        sales = data.map((s) => ({
          ...s,
          display_name: s.customer_name ?? `فروش شماره ${s.id}`,
          remaining: s.remaining ?? s.net_sales - s.total_paid ?? 0,
          ref_type: "sale",
        }));
      }

      let purchases = [];
      if (purchasesRes.status === "fulfilled") {
        const data = Array.isArray(purchasesRes.value.data?.data)
          ? purchasesRes.value.data.data
          : Array.isArray(purchasesRes.value.data)
          ? purchasesRes.value.data
          : [];
        purchases = data.map((p) => ({
          ...p,
          display_name: p.supplier_name ?? `خرید شماره ${p.id}`,
          remaining: p.remaining ?? p.total_amount - p.total_paid ?? 0,
          ref_type: "parchase",
        }));
      }

      setTransactions({ sale: sales, parchase: purchases });
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      toast.error("خطا در دریافت داده‌ها");
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const registrationMap = useMemo(() => {
    const map = {};
    registrations.forEach((r) => {
      map[`${r.reg_type}_${r.reg_id}`] = r;
    });
    return map;
  }, [registrations]);

  const getRef = (type, id) => {
    if (["doctor", "patient", "customer", "supplier"].includes(type)) {
      return registrationMap[`${type}_${id}`] ?? null;
    }
    if (["sale", "parchase"].includes(type)) {
      return transactions[type]?.find((t) => t.id === id) ?? null;
    }
    return null;
  };

  const refTypes = useMemo(() => {
    return [...new Set([...registrations.map((r) => r.reg_type), "sale", "parchase"])];
  }, [registrations]);

  const filteredRefs = useMemo(() => {
    if (!form.ref_type) return [];
    if (["doctor", "patient", "customer", "supplier"].includes(form.ref_type)) {
      return registrations.filter((r) => r.reg_type === form.ref_type);
    }
    return transactions[form.ref_type] || [];
  }, [form.ref_type, registrations, transactions]);

  const combinedRows = useMemo(() => {
    const rows = [];

    // فروش
    transactions.sale.forEach((s) => {
      rows.push({
        id: `sale_${s.id}`,
        date: s.sales_date,
        entry_type: s.entry_type ?? "debit",
        description: `فروش کالا یا خدمت شماره ${s.id}`,
        amount: s.net_sales,
        paid: s.total_paid ?? 0,
        remaining: s.remaining ?? 0,
        source_type: "sale",
        source_name: s.display_name,
      });
    });

    // خرید — اصلاح شده برای نمایش بلافاصله
    transactions.parchase.forEach((p) => {
      rows.push({
        id: `parchase_${p.id}`,
        date: p.purchase_date,
        entry_type: p.entry_type ?? "credit",
        description: `خرید کالا یا خدمت شماره ${p.id}`,
        amount: p.total_amount,
        paid: p.total_paid ?? 0,
        remaining: p.remaining ?? 0,
        source_type: "parchase",
        source_name: p.display_name,
      });
    });

    // نسخه‌ها
    journals.forEach((v) => {
      if (v.ref_type === "patient") {
        const ref = getRef(v.ref_type, v.ref_id);
        rows.push({
          id: `patient_${v.id}`,
          date: v.journal_date,
          entry_type: v.entry_type,
          description: v.description ?? `نسخه شماره ${v.id}`,
          amount: v.amount,
          paid: 0,
          remaining: v.amount,
          source_type: "patient",
          source_name: ref?.full_name ?? "-",
        });
      }
    });

    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, journals]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return combinedRows;
    const term = searchTerm.toLowerCase();
    return combinedRows.filter((row) => {
      return (
        (row.source_name ?? "").toLowerCase().includes(term) ||
        (row.description ?? "").toLowerCase().includes(term) ||
        (REF_TYPE_FA[row.source_type] ?? "").toLowerCase().includes(term)
      );
    });
  }, [combinedRows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const currentRows = filteredRows.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value, ...(name === "ref_type" ? { ref_id: "" } : {}) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast.error("مبلغ باید بزرگتر از صفر باشد");
    if (!form.ref_type || !form.ref_id) return toast.error("نوع منبع و نام منبع الزامی است");

    try {
      await api.post("/journals", { ...form, amount: Number(form.amount), ref_id: Number(form.ref_id) });
      toast.success("ذخیره شد");
      setForm({ journal_date: "", description: "", entry_type: "debit", amount: "", ref_type: "", ref_id: "" });
      fetchData(); // ⚡ اطمینان از نمایش فوری خرید جدید
    } catch (err) {
      toast.error(err.response?.data?.message || "خطا در ذخیره");
    }
  };

  const inputClass = "w-full rounded-xl px-3 py-1 text-sm bg-[#122b55] text-white border border-[#1e3a8a]";

  return (
    <MainLayoutjur>
      <ToastContainer />
      <h2 style={{ textAlign: "center" }}>ثبت و مدیریت محاسبات</h2>

      <div className="form-container mb-6 flex gap-3">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={inputClass}>
          <option value="">همه نوع‌ها</option>
          {Object.keys(ENTRY_TYPE_FA).map((t) => (
            <option key={t} value={t}>{ENTRY_TYPE_FA[t]}</option>
          ))}
        </select>
        <input type="text" placeholder="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClass} />
      </div>

      <div className="form-container mb-10">
        <form onSubmit={handleSubmit} className="form-grid gap-3">
          <input type="date" name="journal_date" value={form.journal_date} onChange={handleChange} className={inputClass} />
          <select name="entry_type" value={form.entry_type} onChange={handleChange} className={inputClass}>
            {Object.keys(ENTRY_TYPE_FA).map((t) => <option key={t} value={t}>{ENTRY_TYPE_FA[t]}</option>)}
          </select>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="مبلغ" className={inputClass} />
          <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="توضیحات" className={inputClass} />
          <select name="ref_type" value={form.ref_type} onChange={handleChange} className={inputClass}>
            <option value="">نوع منبع</option>
            {refTypes.map((t) => <option key={t} value={t}>{REF_TYPE_FA[t] ?? t}</option>)}
          </select>
          <select name="ref_id" value={form.ref_id} onChange={handleChange} disabled={!form.ref_type} className={inputClass}>
            <option value="">نام منبع</option>
            {filteredRefs.map((r) => <option key={r.id ?? r.reg_id} value={r.id ?? r.reg_id}>{r.full_name ?? r.display_name ?? `شماره ${r.id ?? r.reg_id}`}</option>)}
          </select>
          <button className="bg-blue-700 text-white rounded-xl py-2">ثبت</button>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>نوع</th>
              <th>توضیحات</th>
              <th>مبلغ کل</th>
              <th>پرداخت شده</th>
              <th>باقی‌مانده</th>
              <th>منبع</th>
              <th>نام منبع</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length ? currentRows.map((row) => {
              let bgColor = "#1a1a1a";
              if (row.source_type === "sale") bgColor = "#1a4a70";
              else if (row.source_type === "parchase") bgColor = "#701a1a";
              else if (row.source_type === "patient") bgColor = "#1a701a";

              return (
                <tr key={row.id} style={{ backgroundColor: bgColor, transition: "0.2s", color: "#fff" }}>
                  <td>{row.date}</td>
                  <td>{ENTRY_TYPE_FA[row.entry_type]}</td>
                  <td>{row.description}</td>
                  <td>{row.amount}</td>
                  <td>{row.paid}</td>
                  <td>{row.remaining}</td>
                  <td>{REF_TYPE_FA[row.source_type]}</td>
                  <td>{row.source_name}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan="8" style={{ textAlign: "center" }}>نتیجه‌ای یافت نشد</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>قبلی</button>
          <span>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>بعدی</button>
        </div>
      )}
    </MainLayoutjur>
  );
}

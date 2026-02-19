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
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const [journalsRes, registrationsRes, salesRes, parchaseRes] =
        await Promise.allSettled([
          api.get("/journals", { params: { type: filterType || undefined } }),
          api.get("/registrations"),
          api.get("/sales"),
          api.get("/parchses"),
        ]);

      const journalsData = journalsRes.status === "fulfilled" ? journalsRes.value.data ?? [] : [];
      const regs = registrationsRes.status === "fulfilled" ? registrationsRes.value.data ?? [] : [];
      const sales = salesRes.status === "fulfilled" ? salesRes.value.data ?? [] : [];
      const parchases = parchaseRes.status === "fulfilled" ? parchaseRes.value.data ?? [] : [];
            console.log("PARCHASE API RESPONSE:", parchases);
    console.log("SALES API RESPONSE:", sales);
      setJournals(Array.isArray(journalsData) ? journalsData.reverse() : []);
      setRegistrations(Array.isArray(regs) ? regs : []);
      setTransactions({
        sale: Array.isArray(sales) ? sales : [],
        parchase: Array.isArray(parchases) ? parchases : [],
      });

      setCurrentPage(1);
    } catch (err) {
      toast.error("خطا در دریافت داده‌ها");
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  // ================= REGISTRATION MAP =================
  const registrationMap = useMemo(() => {
    const map = {};
    registrations.forEach((r) => {
      map[`${r.reg_type}_${r.reg_id}`] = r;
    });
    return map;
  }, [registrations]);

  const getRef = (type, id) => registrationMap[`${type}_${id}`] ?? null;

  // ================= REF TYPES =================
  const refTypes = useMemo(() => {
    const regTypes = Array.isArray(registrations) ? registrations.map((r) => r.reg_type) : [];
    return [...new Set([...regTypes, "sale", "parchase"])];
  }, [registrations]);

  const filteredRefs = useMemo(() => {
    if (!form.ref_type) return [];

    if (["doctor", "patient", "customer", "supplier"].includes(form.ref_type)) {
      return registrations.filter((r) => r.reg_type === form.ref_type);
    }

    return Array.isArray(transactions[form.ref_type]) ? transactions[form.ref_type] : [];
  }, [form.ref_type, registrations, transactions]);

  const combinedRows = useMemo(() => {
  const rows = [];

  // فروش
  transactions.sale.forEach((s) => {
    const total = Number(s.net_sales ?? 0);
    const paid = Number(s.total_paid ?? 0);

    rows.push({
      id: `sale_${s.sales_id ?? s.id}`,
      date: s.sales_date ?? "",
      entry_type: "debit",
      description: `فروش شماره ${s.sales_id ?? s.id}`,
      amount: total,
      paid: paid,
      remaining: total - paid,
      source_type: "sale",
      source_name: s.customer_name ?? "مشتری",
    });
  });

  // خرید
 transactions.parchase.forEach((p) => {
  const total = Number(p.total_parchase ?? 0);
  const paid = Number(p.par_paid ?? 0);
  const remaining = total - paid;
  const supplierName = p.supplier?.full_name ?? "حمایت‌کننده";

  rows.push({
    id: `parchase_${p.parchase_id}`,
    date: p.parchase_date ?? "",
    entry_type: "debit",
    description: `خرید شماره ${p.parchase_id}`,
    amount: total,
    paid: paid,
    remaining: remaining,
    source_type: "parchase",
    source_name: supplierName,
  });
});


  // ژورنال‌های دیگر (نسخه مریض و خریدهای ثبت شده در ژورنال)
  journals.forEach((j) => {
    if (j.ref_type === "patient") {
      rows.push({
        id: `patient_${j.id}`,
        date: j.journal_date,
        entry_type: j.entry_type,
        description: j.description ?? "نسخه مریض",
        amount: Number(j.amount ?? 0),
        paid: j.entry_type === "credit" ? Number(j.amount ?? 0) : Number(j.amount ?? 0),
        remaining: j.entry_type === "debit" ? Number(j.amount ?? 0) : 0,
        source_type: "patient",
        source_name: getRef("patient", j.ref_id)?.full_name ?? "مریض",
      });
    }
 if (j.ref_type === "parchase") {

  const purchase = transactions.parchase.find(
    (p) => Number(p.parchase_id) === Number(j.ref_id)
  );

  const supplierName =
    purchase?.supplier?.full_name ??
    purchase?.items?.[0]?.supplier?.full_name ??
    "";

  rows.push({
    id: `parchase_journal_${j.id}`,
    date: j.journal_date,
    entry_type: j.entry_type,

    // ✅ شماره نسخه قطعی
    description: `خرید شماره ${Number(j.ref_id)}`,

    amount: Number(j.amount ?? 0),
    paid: j.entry_type === "credit" ? Number(j.amount ?? 0) : 0,
    remaining: j.entry_type === "debit" ? Number(j.amount ?? 0) : 0,
    source_type: "parchase",

    // ✅ نام حمایت‌کننده قطعی
    source_name: supplierName,
  });
}


    
  });

  return rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}, [transactions, journals, registrationMap]);

  // ================= SEARCH =================
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return combinedRows;
    const term = searchTerm.toLowerCase();
    return combinedRows.filter(
      (row) =>
        row.source_name?.toLowerCase().includes(term) ||
        row.description?.toLowerCase().includes(term)
    );
  }, [combinedRows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const currentRows = filteredRows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const inputClass =
    "bg-[#111] text-white border border-gray-600 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "ref_type" ? { ref_id: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast.error("مبلغ باید بزرگتر از صفر باشد");
    if (!form.ref_type || !form.ref_id) return toast.error("نوع منبع و نام منبع الزامی است");

    try {
      await api.post("/journals", { ...form, amount: Number(form.amount), ref_id: Number(form.ref_id) });
      toast.success("ذخیره شد");
      setForm({ journal_date: "", description: "", entry_type: "debit", amount: "", ref_type: "", ref_id: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "خطا در ذخیره");
    }
  };

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

        <input
          type="text"
          placeholder="جستجو..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="form-container mb-10">
        <form onSubmit={handleSubmit} className="form-grid gap-3">
          <input type="date" name="journal_date" value={form.journal_date} onChange={handleChange} className={inputClass} required />
          <select name="entry_type" value={form.entry_type} onChange={handleChange} className={inputClass} required>
            {Object.keys(ENTRY_TYPE_FA).map((t) => <option key={t} value={t}>{ENTRY_TYPE_FA[t]}</option>)}
          </select>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="مبلغ" className={inputClass} required />
          <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="توضیحات" className={inputClass} />
          <select name="ref_type" value={form.ref_type} onChange={handleChange} className={inputClass} required>
            <option value="">نوع منبع</option>
            {refTypes.map((t) => <option key={t} value={t}>{REF_TYPE_FA[t] ?? t}</option>)}
          </select>
          <select name="ref_id" value={form.ref_id} onChange={handleChange} disabled={!form.ref_type} className={inputClass} required>
            <option value="">نام منبع</option>
            {filteredRefs.map((r) => {
              const id = r.sales_id || r.parchase_id || r.id || r.reg_id;
              const name = r.full_name || r.customer_name || r.supplier_name || r.name || `شماره ${id}`;
              return <option key={id} value={id}>{name}</option>;
            })}
          </select>
          <button type="submit" className="bg-blue-700 text-white rounded-xl py-2 hover:bg-blue-800">ثبت</button>
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
            {currentRows.length ? (
              currentRows.map((row) => {
                let bgColor = "#1a1a1a";
                if (row.source_type === "sale") bgColor = "#1a4a70";
                else if (row.source_type === "parchase") bgColor = "#701a1a";
                else if (row.source_type === "patient") bgColor = "#1a701a";

                return (
                  <tr key={row.id} style={{ backgroundColor: bgColor, transition: "0.2s", color: "#fff" }}>
                    <td>{row.date || "-"}</td>
                    <td>{ENTRY_TYPE_FA[row.entry_type] || "-"}</td>
                    <td>{row.description || "-"}</td>
                    <td>{row.amount ?? 0}</td>
                    <td>{row.paid ?? 0}</td>
                    <td>{row.remaining ?? 0}</td>
                    <td>{REF_TYPE_FA[row.source_type] || "-"}</td>
                    <td>{row.source_name || "-"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>نتیجه‌ای یافت نشد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50">قبلی</button>
          <span className="px-4 py-2">{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50">بعدی</button>
        </div>
      )}
    </MainLayoutjur>
  );
}

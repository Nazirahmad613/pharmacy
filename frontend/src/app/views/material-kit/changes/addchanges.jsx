import { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";
import MainLayoutjur from "../../../../components/MainLayoutjur";

const ENTRY_TYPE_FA = { debit: "اخذ پول", credit: "پرداخت پول" };
const REF_TYPE_FA = {
  sale: "فروش",
  parchase: "خرید",
  payment_in: "دریافت وجه",
  payment_out: "پرداخت وجه",
  parchase_due: "پرداخت قرض خرید",
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
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const ENTRY_TYPES = ["debit", "credit"];
  const ROWS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

   const fetchData = async () => {
  try {
    const [journalsRes, registrationsRes, salesRes, purchasesRes] =
      await Promise.allSettled([
        api.get("/journals", {
          params: {
            type: filterType || undefined,
            from: filterFrom || undefined,
            to: filterTo || undefined,
          },
        }),
        api.get("/registrations"),
        api.get("/sales"),
        api.get("/purchases"),
      ]);

    // ===== journals =====
    if (journalsRes.status === "fulfilled") {
      const data = Array.isArray(journalsRes.value.data?.data)
        ? journalsRes.value.data.data
        : Array.isArray(journalsRes.value.data)
        ? journalsRes.value.data
        : [];
      setJournals([...data].reverse());
    } else {
      console.error("journals fetch error:", journalsRes.reason);
      toast.error("خطا در دریافت ژورنال‌ها");
    }

    // ===== registrations =====
    if (registrationsRes.status === "fulfilled") {
      const data = Array.isArray(registrationsRes.value.data?.data)
        ? registrationsRes.value.data.data
        : Array.isArray(registrationsRes.value.data)
        ? registrationsRes.value.data
        : [];
      setRegistrations(data);
    } else {
      console.error("registrations fetch error:", registrationsRes.reason);
      toast.error("خطا در دریافت منابع");
    }

    // ===== transactions =====
    const sales = [];
    const purchases = [];

    // --- sales ---
    if (salesRes.status === "fulfilled") {
      const salesData = Array.isArray(salesRes.value.data?.data)
        ? salesRes.value.data.data
        : Array.isArray(salesRes.value.data)
        ? salesRes.value.data
        : [];
      sales.push(
        ...salesData.map((s) => ({
          ...s,
          customer_name: s.customer_name ?? s.customer?.full_name ?? "-",
          supplier_name: s.items?.[0]?.supplier_name ?? s.items?.[0]?.supplier?.full_name ?? "-",
        }))
      );
    } else {
      console.error("sales fetch error:", salesRes.reason);
    }

    // --- purchases ---
    if (purchasesRes.status === "fulfilled") {
      const purchaseData = Array.isArray(purchasesRes.value.data?.data)
        ? purchasesRes.value.data.data
        : Array.isArray(purchasesRes.value.data)
        ? purchasesRes.value.data
        : [];
      purchases.push(
        ...purchaseData.map((p) => ({
          ...p,
          supplier_name: p.supplier_name ?? p.supplier?.full_name ?? "-",
        }))
      );
    } else {
      console.error("purchases fetch error:", purchasesRes.reason);
    }

    setTransactions({ sale: sales, parchase: purchases });
    setCurrentPage(1);
  } catch (err) {
    console.error("fetchData error:", err);
    toast.error("خطا در دریافت داده‌ها");
  }
};


  useEffect(() => {
    fetchData();
  }, [filterType, filterFrom, filterTo]);

  /* ===== map منابع ===== */
  const registrationMap = useMemo(() => {
    const map = {};
    registrations.forEach((r) => {
      map[`${r.reg_type}_${Number(r.reg_id)}`] = r;
    });
    return map;
  }, [registrations]);

  const getRef = (ref_type, ref_id) => {
    if (["doctor", "patient", "customer", "supplier"].includes(ref_type)) {
      return registrationMap[`${ref_type}_${Number(ref_id)}`] ?? null;
    } else if (["sale", "parchase"].includes(ref_type)) {
      return transactions[ref_type]?.find((t) => Number(t.id) === Number(ref_id)) ?? null;
    }
    return null;
  };

  const filteredJournals = useMemo(() => {
    if (!searchTerm.trim()) return journals;
    const term = searchTerm.toLowerCase();
    return journals.filter((j) => {
      const ref = getRef(j.ref_type, j.ref_id);
      const name =
        ref?.full_name ?? ref?.customer_name ?? ref?.supplier_name ?? ref?.doctor_name ?? ref?.patient_name ?? "";
      return (REF_TYPE_FA[j.ref_type] ?? "").toLowerCase().includes(term) || name.toLowerCase().includes(term);
    });
  }, [searchTerm, journals, registrationMap, transactions]);

  const totalPages = Math.ceil(filteredJournals.length / ROWS_PER_PAGE);
  const currentRows = filteredJournals.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  /* ===== فرم ===== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value, ...(name === "ref_type" ? { ref_id: "" } : {}) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) return toast.error("مبلغ باید بزرگتر از صفر باشد");
    if (!form.ref_type || !form.ref_id) return toast.error("نوع منبع و نام منبع الزامی است");

    try {
      await api.post("/journals", { ...form, amount: Number(form.amount), ref_id: Number(form.ref_id) });
      toast.success("ذخیره شد");
      setForm({ journal_date: "", description: "", entry_type: "debit", amount: "", ref_type: "", ref_id: "" });
      fetchData();
    } catch (err) {
      console.error("handleSubmit error:", err);
      toast.error(err.response?.data?.message || "خطا در ذخیره");
    }
  };

  const filteredRegistrations = registrations.filter((r) => r.reg_type === form.ref_type);

  const inputClass = "w-full rounded-xl px-3 py-1 text-sm bg-[#122b55] text-white border border-[#1e3a8a]";

  /* ===== Render ===== */
  return (
    <MainLayoutjur>
      <ToastContainer />
      <h2 style={{ textAlign: "center" }}>ثبت و مدیریت محاسبات</h2>

      {/* ===== فیلتر + جستجو ===== */}
      <div className="form-container mb-6">
        <div className="form-grid">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={inputClass}
          >
            <option value="">همه نوع‌ها</option>
            {ENTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ENTRY_TYPE_FA[t]}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className={inputClass}
          />

          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className={inputClass}
          />

          <input
            type="text"
            placeholder="جستجو: مشتری، داکتر، مریض..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={inputClass}
          />
        </div>
      </div>

      {/* ===== فرم ثبت ===== */}
      <div className="form-container mb-10">
        <h2 style={{ textAlign: "center" }}>ثبت محاسبات جدید</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <input
              type="date"
              name="journal_date"
              value={form.journal_date}
              onChange={handleChange}
              className={inputClass}
            />

            <select
              name="entry_type"
              value={form.entry_type}
              onChange={handleChange}
              className={inputClass}
            >
              {ENTRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ENTRY_TYPE_FA[t]}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="مبلغ"
              className={inputClass}
            />

            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="توضیحات"
              className={inputClass}
            />

            <select
              name="ref_type"
              value={form.ref_type}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">نوع منبع</option>
              {[...new Set(registrations.map((r) => r.reg_type))].map(
                (t) => (
                  <option key={t} value={t}>
                    {REF_TYPE_FA[t] ?? t}
                  </option>
                )
              )}
            </select>

            <select
              name="ref_id"
              value={form.ref_id}
              onChange={handleChange}
              disabled={!form.ref_type}
              className={inputClass}
            >
              <option value="">نام منبع</option>
              {filteredRegistrations.map((r) => (
                <option key={r.reg_id} value={String(r.reg_id)}>
                  {r.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center mt-6">
            <button className="px-10 py-2 bg-blue-700 rounded-xl text-white">
              ثبت
            </button>
          </div>
        </form>
      </div>

      {/* ===== جدول ژورنال‌ها ===== */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>نوع</th>
              <th>توضیحات</th>
              <th>مبلغ</th>
              <th>منبع</th>
              <th>نام منبع</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length ? (
              currentRows.map((j) => {
                const ref = getRef(j.ref_type, j.ref_id);
                const name =
                  ref?.full_name ??
                  ref?.customer_name ??
                  ref?.supplier_name ??
                  ref?.doctor_name ??
                  ref?.patient_name ??
                  "-";

                return (
                  <tr key={j.id}>
                    <td>{j.journal_date}</td>
                    <td>{ENTRY_TYPE_FA[j.entry_type]}</td>
                    <td>{j.description || "-"}</td>
                    <td>{j.amount}</td>
                    <td>{REF_TYPE_FA[j.ref_type]}</td>
                    <td>{name}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  نتیجه‌ای یافت نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            قبلی
          </button>

          <span>
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            بعدی
          </button>
        </div>
      )}
    </MainLayoutjur>
  );
}

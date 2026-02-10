import { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";
import MainLayoutjur from "../../../../components/MainLayoutjur";

/* ===== دیکشنری ترجمه ===== */
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

  const [form, setForm] = useState({
    id: null,
    journal_date: "",
    description: "",
    entry_type: "debit",
    amount: "",
    ref_type: "",
    ref_id: "",
  });

  const [editing, setEditing] = useState(false);

  /* ===== فیلترها ===== */
  const [filterType, setFilterType] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // 🔥 جستجو

  const ENTRY_TYPES = ["debit", "credit"];

  /* ===== پجینیشن ===== */
  const ROWS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchJournals = async () => {
    try {
      const res = await api.get("/journals", {
        params: {
          type: filterType || undefined,
          from: filterFrom || undefined,
          to: filterTo || undefined,
        },
      });
      setJournals((res.data.data ?? res.data ?? []).reverse());
      setCurrentPage(1);
    } catch {
      toast.error("خطا در دریافت ژورنال‌ها");
    }
  };

  const fetchRegistrations = async () => {
    try {
      const res = await api.get("/registrations");
      setRegistrations(res.data ?? []);
    } catch {
      toast.error("خطا در دریافت منابع");
    }
  };

  useEffect(() => {
    fetchJournals();
    fetchRegistrations();
  }, [filterType, filterFrom, filterTo]);

  /* ===== جستجوی هوشمند ===== */
  const filteredJournals = useMemo(() => {
    if (!searchTerm.trim()) return journals;

    const term = searchTerm.toLowerCase();

    return journals.filter((j) => {
      const ref = registrations.find(
        (r) => r.reg_type === j.ref_type && r.reg_id === j.ref_id
      );

      return (
        (REF_TYPE_FA[j.ref_type] ?? j.ref_type)
          .toLowerCase()
          .includes(term) ||
        ref?.full_name?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, journals, registrations]);

  const totalPages = Math.ceil(filteredJournals.length / ROWS_PER_PAGE);
  const currentRows = filteredJournals.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) {
      toast.error("مبلغ باید بزرگتر از صفر باشد");
      return;
    }

    try {
      editing
        ? await api.put(`/journals/${form.id}`, form)
        : await api.post("/journals", form);

      toast.success(editing ? "بروزرسانی شد" : "ذخیره شد");
      setEditing(false);
      setForm({
        id: null,
        journal_date: "",
        description: "",
        entry_type: "debit",
        amount: "",
        ref_type: "",
        ref_id: "",
      });
      fetchJournals();
    } catch (err) {
      toast.error(err.response?.data?.message || "خطا در ذخیره");
    }
  };

  const handleEdit = (j) => {
    setForm(j);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف شود؟")) return;
    await api.delete(`/journals/${id}`);
    fetchJournals();
  };

  const inputClass =
    "w-full rounded-xl px-3 py-1 text-sm bg-[#122b55] text-white border border-[#1e3a8a]";

  return (
    <MainLayoutjur>
      <ToastContainer />

      <h1 className="text-center text-white mb-5">مدیریت ژورنال‌ها</h1>

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

          <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className={inputClass} />
          <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className={inputClass} />

          {/* 🔍 جستجو */}
          <input
            type="text"
            placeholder="جستجو: نام مشتری، داکتر، مریض..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={inputClass}
          />
        </div>
      </div>

      {/* ===== جدول ===== */}
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
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length ? (
              currentRows.map((j) => {
                const ref = registrations.find(
                  (r) => r.reg_type === j.ref_type && r.reg_id === j.ref_id
                );
                return (
                  <tr key={j.id}>
                    <td>{j.journal_date}</td>
                    <td>{ENTRY_TYPE_FA[j.entry_type]}</td>
                    <td>{j.description || "-"}</td>
                    <td>{j.amount}</td>
                    <td>{REF_TYPE_FA[j.ref_type]}</td>
                    <td>{ref?.full_name || "-"}</td>
                    <td>
                      <button className="edit" onClick={() => handleEdit(j)}>ویرایش</button>
                      <button className="delete" onClick={() => handleDelete(j.id)}>حذف</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  نتیجه‌ای یافت نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Pagination ===== */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>قبلی</button>
          <span>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>بعدی</button>
        </div>
      )}
    </MainLayoutjur>
  );
}

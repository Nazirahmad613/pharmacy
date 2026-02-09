import { useState, useEffect } from "react";
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
  const [pagination, setPagination] = useState({});
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

  const [filterType, setFilterType] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const ENTRY_TYPES = ["debit", "credit"];

 // تغییر تابع fetchJournals
const fetchJournals = async (url = "/journals") => {
  try {
    const res = await api.get(url, {
      params: {
        type: filterType || undefined,        // نوع (debit/credit)
        from: filterFrom || undefined,        // تاریخ شروع
        to: filterTo || undefined,            // تاریخ پایان
        ref_type: form.ref_type || undefined, // نوع رویداد
        ref_id: form.ref_id || undefined,     // شناسه منبع
      },
    });

    // نمایش آخرین ژورنال‌ها ابتدا
    const data = res.data.data ?? res.data ?? [];
    setJournals(data.slice().reverse());

    setPagination({
      last_page: res.data.last_page ?? 1,
      prev_page_url: res.data.prev_page_url ?? null,
      next_page_url: res.data.next_page_url ?? null,
    });
  } catch {
    toast.error("خطا در دریافت ژورنال‌ها");
  }
};

// دکمه اعمال فیلتر
<button
  onClick={(e) => {
    e.preventDefault();
    fetchJournals("/journals?page=1");
  }}
  className="px-4 py-2 bg-blue-700 rounded-xl text-white font-medium hover:bg-blue-800 transition"
>
  اعمال فیلتر
</button>



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
      if (editing) {
        await api.put(`/journals/${form.id}`, form);
        toast.success("بروزرسانی شد");
      } else {
        await api.post("/journals", form);
        toast.success("ذخیره شد");
      }

      setForm({
        id: null,
        journal_date: "",
        description: "",
        entry_type: "debit",
        amount: "",
        ref_type: "",
        ref_id: "",
      });
      setEditing(false);
      fetchJournals();
    } catch (err) {
      toast.error(err.response?.data?.message || "خطا در ذخیره");
    }
  };

  const handleEdit = (j) => {
    setForm({
      id: j.id,
      journal_date: j.journal_date,
      description: j.description,
      entry_type: j.entry_type,
      amount: j.amount,
      ref_type: j.ref_type,
      ref_id: j.ref_id,
    });
    setEditing(true);
  };
 const handleDelete = async (id) => {
  if (!confirm("حذف شود؟")) return;
  try {
    await api.delete(`/journals/${id}`);
    toast.success("حذف شد");
    fetchJournals("/journals?page=1"); // همیشه داده‌ها را از صفحه اول بارگذاری کن
  } catch {
    toast.error("خطا در حذف");
  }
};


  const filteredRegistrations = registrations.filter(
    (r) => r.reg_type === form.ref_type
  );

  const inputClass =
    "w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[#122b55] text-white border border-[#1e3a8a]";

  return (
    <MainLayoutjur title="مدیریت ژورنال‌ها">
      <ToastContainer />

  {/* Filter */} 
<div className="form-container mb-8">
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
    <button
      onClick={() => fetchJournals("/journals?page=1")}
      className="px-4 py-2 bg-blue-700 rounded-xl text-white font-medium hover:bg-blue-800 transition"
    >
      اعمال فیلتر
    </button>
  </div>
</div>


      {/* Form */}
      <div className="form-container">
        <h2 className="text-center text-xl font-semibold mb-6 text-white">
          {editing ? "ویرایش ژورنال" : "ثبت ژورنال جدید"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>تاریخ ثبت</label>
              <input
                type="date"
                name="journal_date"
                value={form.journal_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label>نوع ثبت</label>
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
            </div>

            <div>
              <label>توضیحات</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label>مبلغ</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label>نوع رویداد</label>
              <select
                name="ref_type"
                value={form.ref_type}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">انتخاب کنید</option>
                {[...new Set(registrations.map((r) => r.reg_type))].map((t) => (
                  <option key={t} value={t}>
                    {REF_TYPE_FA[t] ?? t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>نام منبع</label>
              <select
                name="ref_id"
                value={form.ref_id}
                onChange={handleChange}
                disabled={!form.ref_type}
                className={inputClass}
              >
                <option value="">انتخاب کنید</option>
                {filteredRegistrations.map((r) => (
                  <option key={r.reg_id} value={r.reg_id}>
                    {r.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center mt-6">
            <button className="px-10 py-2 bg-blue-700 rounded-xl text-white font-semibold hover:bg-blue-800 transition">
              {editing ? "بروزرسانی" : "ذخیره"}
            </button>
          </div>
        </form>
      </div>
 {/* Table */}
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
      {journals.length
        ? journals.map((j) => {
            const refObj = registrations.find(
              (r) => r.reg_type === j.ref_type && r.reg_id === j.ref_id
            );
            return (
              <tr key={j.id}>
                <td>{j.journal_date}</td>
                <td>{ENTRY_TYPE_FA[j.entry_type]}</td>
                <td>{j.description || "-"}</td>
                <td>{j.amount}</td>
                <td>{REF_TYPE_FA[j.ref_type] ?? j.ref_type}</td>
                <td>{refObj ? refObj.full_name : j.ref_id}</td>
                <td className="space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEdit(j)}
                    className="edit"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="delete"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            );
          })
        : (
          <tr>
            <td colSpan="7" className="text-center text-gray-300 p-6">
              رکوردی یافت نشد
            </td>
          </tr>
        )}
    </tbody>
  </table>
</div>


      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          {pagination.prev_page_url && (
            <button
              onClick={() => fetchJournals(pagination.prev_page_url)}
              className="px-5 py-2 bg-blue-700 rounded-xl text-white hover:bg-blue-800 transition"
            >
              قبلی
            </button>
          )}
          {pagination.next_page_url && (
            <button
              onClick={() => fetchJournals(pagination.next_page_url)}
              className="px-5 py-2 bg-blue-700 rounded-xl text-white hover:bg-blue-800 transition"
            >
              بعدی
            </button>
          )}
        </div>
      )}
    </MainLayoutjur>
  );
}

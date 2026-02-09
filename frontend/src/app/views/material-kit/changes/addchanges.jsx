import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";
import MainLayoutpur from "../../../../components/MainLayoutpur";

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

  const fetchJournals = async (url = "/journals") => {
    try {
      const res = await api.get(url, {
        params: {
          type: filterType || undefined,
          from: filterFrom || undefined,
          to: filterTo || undefined,
        },
      });

      setJournals(res.data.data ?? res.data ?? []);
      setPagination({
        last_page: res.data.last_page ?? 1,
        prev_page_url: res.data.prev_page_url ?? null,
        next_page_url: res.data.next_page_url ?? null,
      });
    } catch {
      toast.error("خطا در بارگذاری ژورنال‌ها");
    }
  };

  // دریافت همه registrations برای ref_type / ref_id
  const fetchRegistrations = async () => {
    try {
      const res = await api.get("/registrations"); // backend باید route بدهد
      setRegistrations(res.data ?? []);
    } catch {
      toast.error("خطا در بارگذاری ثبت‌نام‌ها");
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
      toast.error("مبلغ باید بزرگتر از صفر باشد.");
      return;
    }

    if (!form.entry_type) {
      toast.error("نوع Entry را انتخاب کنید.");
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
      fetchJournals();
    } catch {
      toast.error("خطا در حذف");
    }
  };

  // Filter registrations by selected type
  const filteredRegistrations = registrations.filter(r => r.reg_type === form.ref_type);

  return (
    <MainLayoutpur>
      <div className="min-h-screen bg-blue-900 flex justify-center py-8">
        <ToastContainer />

        <div className="w-full max-w-7xl px-4">
          {/* عنوان */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">مدیریت ژورنال‌ها</h1>
            <p className="text-blue-200 mt-1">نمایش و ثبت رویدادهای مالی</p>
          </div>

          {/* فیلتر */}
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-lg p-2"
              >
                <option value="">همه نوع‌ها</option>
                {ENTRY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="border rounded-lg p-2" />
              <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="border rounded-lg p-2" />

              <button onClick={() => fetchJournals()} className="bg-blue-700 text-white rounded-lg">
                اعمال فیلتر
              </button>
            </div>
          </div>

          {/* فرم */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {editing ? "ویرایش ژورنال" : "ثبت ژورنال"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* تاریخ و توضیحات */}
                <div>
                  <label className="text-sm">تاریخ</label>
                  <input
                    type="date"
                    name="journal_date"
                    value={form.journal_date}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                   {/* Entry Type */}
                <div>
                  <label className="text-sm">نوع Entry</label>
                  <select
                    name="entry_type"
                    value={form.entry_type}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                  >
                    {ENTRY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>





                <div>
                  <label className="text-sm">شرح</label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                  />
                </div>

               
                {/* Amount */}
                <div>
                  <label className="text-sm">مبلغ</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                {/* ref_type */}
                <div>
                  <label className="text-sm">نوع رویداد</label>
                  <select
                    name="ref_type"
                    value={form.ref_type}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">انتخاب کنید</option>
                    {[...new Set(registrations.map(r => r.reg_type))].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

             <select
  name="ref_id"
  value={form.ref_id}
  onChange={handleChange}
  className="w-full border rounded-lg p-2"
  disabled={!form.ref_type}
>
  <option value="">انتخاب کنید</option>
  {filteredRegistrations.map(r => (
    <option key={r.reg_id} value={r.reg_id}>
      {r.full_name} {/* ← اینجا فول نیم نمایش داده می‌شود */}
    </option>
  ))}
</select>

              </div>

              <div className="text-center mt-5">
                <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2 rounded-lg">
                  {editing ? "بروزرسانی" : "ذخیره"}
                </button>
              </div>
            </form>
          </div>
 {/* جدول */}
<div className="bg-white rounded-xl shadow overflow-x-auto">
  <table className="w-full text-sm text-center">
    <thead className="bg-blue-100 text-blue-900">
      <tr>
        <th className="p-3">تاریخ</th>
        <th className="p-3">نوع</th>
        <th className="p-3">شرح</th>
        <th className="p-3">مبلغ</th>
        <th className="p-3">منبع</th> {/* ref_type به فارسی */}
        <th className="p-3">نام منبع</th>
        <th className="p-3">عملیات</th>
      </tr>
    </thead>
    <tbody>
      {journals.length ? journals.map((j) => {
        // پیدا کردن نام مرتبط با ref_id و ref_type
        const refObj = registrations.find(r => r.reg_type === j.ref_type && r.reg_id === j.ref_id);
        const refName = refObj ? refObj.full_name : j.ref_id; // اگر پیدا نشد، آی‌دی نمایش داده شود

        // ترجمه ref_type به فارسی
        let refTypeFa = "";
        switch(j.ref_type){
          case "sale": refTypeFa = "فروش"; break;
          case "parchase": refTypeFa = "خرید"; break;
          case "payment_in": refTypeFa = "دریافت وجه"; break;
          case "payment_out": refTypeFa = "پرداخت وجه"; break;
          case "parchase_due": refTypeFa = "بدهی خرید"; break;
          default: refTypeFa = j.ref_type; // اگر چیز دیگری بود همان را نشان بده
        }

        return (
          <tr key={j.id} className="border-t hover:bg-gray-50">
            <td className="p-2">{j.journal_date}</td>
            <td className="p-2">{j.entry_type === "debit" ? "بدهکار" : "بستانکار"}</td>
            <td className="p-2">{j.description || "-"}</td>
            <td className="p-2">{j.amount}</td>
            <td className="p-2">{refTypeFa}</td> {/* ← نمایش فارسی منبع */}
            <td className="p-2">{refName}</td> {/* ← نام واقعی نمایش داده می‌شود */}
            <td className="p-2 space-x-2 space-x-reverse">
              <button onClick={() => handleEdit(j)} className="bg-yellow-400 px-3 py-1 rounded text-white">ویرایش</button>
              <button onClick={() => handleDelete(j.id)} className="bg-red-600 px-3 py-1 rounded text-white">حذف</button>
            </td>
          </tr>
        )
      }) : (
        <tr>
          <td colSpan="7" className="p-6 text-gray-500">رکوردی یافت نشد</td>
        </tr>
      )}
    </tbody>
  </table>
</div>



          {/* pagination */}
          {pagination.last_page > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              {pagination.prev_page_url && (
                <button onClick={() => fetchJournals(pagination.prev_page_url)} className="px-4 py-1 bg-white rounded shadow">
                  قبلی
                </button>
              )}
              {pagination.next_page_url && (
                <button onClick={() => fetchJournals(pagination.next_page_url)} className="px-4 py-1 bg-white rounded shadow">
                  بعدی
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayoutpur>
  );
}

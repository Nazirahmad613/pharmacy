import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";
import MainLayoutpur from "../../../../components/MainLayoutpur";

export default function JournalPage() {
  const { api } = useAuth();
  const [journals, setJournals] = useState([]);
  const [pagination, setPagination] = useState({});
  const [form, setForm] = useState({
    id: null,
    journal_date: "",
    description: "",
    debit: "",
    credit: "",
    ref_type: "",
    ref_id: "",
  });
  const [editing, setEditing] = useState(false);

  const [filterType, setFilterType] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const TYPES = [
    "sale",
    "purchase",
    "expense",
    "payment_in",
    "payment_out",
    "receivable",
    "payable",
    "cash_opening",
    "cash_adjustment",
    "refund_sale",
    "refund_purchase",
  ];

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

  useEffect(() => {
    fetchJournals();
  }, [filterType, filterFrom, filterTo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.debit && form.credit) {
      toast.error("فقط یکی از Debit یا Credit باید پر باشد.");
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
        debit: "",
        credit: "",
        ref_type: "",
        ref_id: "",
      });
      setEditing(false);
      fetchJournals();
    } catch {
      toast.error("خطا در ذخیره");
    }
  };

  const handleEdit = (j) => {
    setForm(j);
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
              {TYPES.map((t) => (
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
              {[
                ["journal_date", "date", "تاریخ"],
                ["description", "text", "شرح"],
                ["debit", "number", "Debit"],
                ["credit", "number", "Credit"],
              ].map(([name, type, label]) => (
                <div key={name}>
                  <label className="text-sm">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              ))}

              <div>
                <label className="text-sm">نوع رویداد</label>
                <select name="ref_type" value={form.ref_type} onChange={handleChange} className="w-full border rounded-lg p-2">
                  <option value="">انتخاب کنید</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm">شناسه مرجع</label>
                <input type="number" name="ref_id" value={form.ref_id} onChange={handleChange} className="w-full border rounded-lg p-2" />
              </div>
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
                <th className="p-3">شرح</th>
                <th className="p-3">Debit</th>
                <th className="p-3">Credit</th>
                <th className="p-3">نوع</th>
                <th className="p-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {journals.length ? journals.map((j) => (
                <tr key={j.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{j.journal_date}</td>
                  <td className="p-2">{j.description}</td>
                  <td className="p-2">{j.debit}</td>
                  <td className="p-2">{j.credit}</td>
                  <td className="p-2">{j.ref_type}</td>
                  <td className="p-2 space-x-2 space-x-reverse">
                    <button onClick={() => handleEdit(j)} className="bg-yellow-400 px-3 py-1 rounded text-white">ویرایش</button>
                    <button onClick={() => handleDelete(j.id)} className="bg-red-600 px-3 py-1 rounded text-white">حذف</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-6 text-gray-500">رکوردی یافت نشد</td>
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

// src/pages/JournalPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function JournalPage() {
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

  // بارگذاری ژورنال‌ها
  const fetchJournals = async (url = "/api/journals") => {
    try {
      const res = await axios.get(url, {
        params: {
          type: filterType || undefined,
          from: filterFrom || undefined,
          to: filterTo || undefined,
        },
      });

      // اگر paginate باشد
      if (res.data.data) {
        setJournals(res.data.data);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          next_page_url: res.data.next_page_url,
          prev_page_url: res.data.prev_page_url,
        });
      } else {
        setJournals(Array.isArray(res.data) ? res.data : []);
        setPagination({});
      }
    } catch (err) {
      toast.error("خطا در بارگذاری ژورنال‌ها");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [filterType, filterFrom, filterTo]);

  // تغییرات فرم
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ذخیره یا بروزرسانی ژورنال
  const handleSubmit = async (e) => {
    e.preventDefault();

    // اعتبارسنجی debit/credit
    if (form.debit && form.credit) {
      toast.error("فقط یکی از Debit یا Credit باید پر باشد.");
      return;
    }

    try {
      if (editing) {
        await axios.put(`/api/journals/${form.id}`, form);
        toast.success("ژورنال با موفقیت بروزرسانی شد");
      } else {
        await axios.post("/api/journals", form);
        toast.success("ژورنال با موفقیت ذخیره شد");
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
    } catch (err) {
      toast.error(err.response?.data?.message || "خطا در ذخیره ژورنال");
      console.error(err);
    }
  };

  // ویرایش ژورنال
  const handleEdit = (journal) => {
    setForm({
      id: journal.id,
      journal_date: journal.journal_date,
      description: journal.description || "",
      debit: journal.debit || "",
      credit: journal.credit || "",
      ref_type: journal.ref_type || "",
      ref_id: journal.ref_id || "",
    });
    setEditing(true);
  };

  // حذف ژورنال
  const handleDelete = async (id) => {
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید حذف کنید؟")) return;
    try {
      await axios.delete(`/api/journals/${id}`);
      toast.success("ژورنال با موفقیت حذف شد");
      fetchJournals();
    } catch (err) {
      toast.error("خطا در حذف ژورنال");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">ژورنال‌ها</h1>

      {/* فیلتر */}
      <div className="mb-4 flex gap-2">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">همه نوع‌ها</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          className="border p-2 rounded"
          placeholder="از تاریخ"
        />

        <input
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          className="border p-2 rounded"
          placeholder="تا تاریخ"
        />

        <button
          onClick={() => fetchJournals()}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          فیلتر
        </button>
      </div>

      {/* فرم ژورنال */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">
          {editing ? "ویرایش ژورنال" : "ژورنال جدید"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>تاریخ</label>
            <input
              type="date"
              name="journal_date"
              value={form.journal_date}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label>شرح</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label>Debit</label>
            <input
              type="number"
              name="debit"
              value={form.debit}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label>Credit</label>
            <input
              type="number"
              name="credit"
              value={form.credit}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label>نوع رویداد</label>
            <select
              name="ref_type"
              value={form.ref_type}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option value="">انتخاب کنید</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>شناسه مرجع (ref_id)</label>
            <input
              type="number"
              name="ref_id"
              value={form.ref_id}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {editing ? "بروزرسانی" : "ذخیره تغییرات"}
        </button>
      </form>

      {/* جدول ژورنال‌ها */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">تاریخ</th>
            <th className="border p-2">شرح</th>
            <th className="border p-2">Debit</th>
            <th className="border p-2">Credit</th>
            <th className="border p-2">نوع</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(journals) && journals.length > 0 ? (
            journals.map((j) => (
              <tr key={j.id}>
                <td className="border p-2">{j.journal_date}</td>
                <td className="border p-2">{j.description}</td>
                <td className="border p-2">{j.debit}</td>
                <td className="border p-2">{j.credit}</td>
                <td className="border p-2">{j.ref_type}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(j)}
                    className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4">
                رکوردی یافت نشد
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination ساده */}
      {pagination.last_page > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {pagination.prev_page_url && (
            <button
              onClick={() => fetchJournals(pagination.prev_page_url)}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              قبلی
            </button>
          )}
          {pagination.next_page_url && (
            <button
              onClick={() => fetchJournals(pagination.next_page_url)}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              بعدی
            </button>
          )}
        </div>
      )}
    </div>
  );
}

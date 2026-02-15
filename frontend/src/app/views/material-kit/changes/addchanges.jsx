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
  const [transactions, setTransactions] = useState({
    sale: [],
    parchase: [],
  });

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

  /* ================= Fetch Data ================= */
  const fetchData = async () => {
    try {
      const [journalsRes, registrationsRes, salesRes, purchasesRes] =
        await Promise.allSettled([
          api.get("/journals", {
            params: { type: filterType || undefined },
          }),
          api.get("/registrations"),
          api.get("/sales"),
          api.get("/purchases"),
        ]);

      if (journalsRes.status === "fulfilled") {
        const data = Array.isArray(journalsRes.value.data?.data)
          ? journalsRes.value.data.data
          : Array.isArray(journalsRes.value.data)
          ? journalsRes.value.data
          : [];
        setJournals([...data].reverse());
      }

      if (registrationsRes.status === "fulfilled") {
        const data = Array.isArray(registrationsRes.value.data?.data)
          ? registrationsRes.value.data.data
          : Array.isArray(registrationsRes.value.data)
          ? registrationsRes.value.data
          : [];
        setRegistrations(data);
      }

      let sales = [];
      if (salesRes.status === "fulfilled") {
        const data = Array.isArray(salesRes.value.data?.data)
          ? salesRes.value.data.data
          : Array.isArray(salesRes.value.data)
          ? salesRes.value.data
          : [];
        sales = data.map((s) => ({
          ...s,
          display_name:
            s.customer_name ??
            s.customer?.full_name ??
            `فروش شماره ${s.id}`,
          type_name: "customer",
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
          display_name:
            p.supplier_name ??
            p.supplier?.full_name ??
            `خرید شماره ${p.id}`,
          type_name: "supplier",
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

  /* ================= Helpers ================= */
  const registrationMap = useMemo(() => {
    const map = {};
    registrations.forEach((r) => {
      map[`${r.reg_type}_${Number(r.reg_id)}`] = r;
    });
    return map;
  }, [registrations]);

  const getRef = (type, id) => {
    if (["doctor", "patient", "customer", "supplier"].includes(type)) {
      return registrationMap[`${type}_${Number(id)}`] ?? null;
    }
    if (["sale", "parchase"].includes(type)) {
      return (
        transactions[type]?.find((t) => Number(t.id) === Number(id)) ?? null
      );
    }
    return null;
  };

  const refTypes = useMemo(() => {
    return [
      ...new Set([
        ...registrations.map((r) => r.reg_type),
        "sale",
        "parchase",
      ]),
    ];
  }, [registrations]);

  const filteredRefs = useMemo(() => {
    if (!form.ref_type) return [];

    if (["doctor", "patient", "customer", "supplier"].includes(form.ref_type)) {
      return registrations.filter((r) => r.reg_type === form.ref_type);
    }

    return transactions[form.ref_type] || [];
  }, [form.ref_type, registrations, transactions]);

  const filteredJournals = useMemo(() => {
    if (!searchTerm.trim()) return journals;

    const term = searchTerm.toLowerCase();

    return journals.filter((j) => {
      const ref = getRef(j.ref_type, j.ref_id);
      const name =
        ref?.full_name ??
        ref?.display_name ??
        ref?.customer_name ??
        ref?.supplier_name ??
        "";
      return (
        (REF_TYPE_FA[j.ref_type] ?? "").toLowerCase().includes(term) ||
        name.toLowerCase().includes(term)
      );
    });
  }, [journals, searchTerm, registrationMap, transactions]);

  const totalPages = Math.ceil(filteredJournals.length / ROWS_PER_PAGE);

  const currentRows = filteredJournals.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  /* ================= Form ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: value,
      ...(name === "ref_type" ? { ref_id: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0)
      return toast.error("مبلغ باید بزرگتر از صفر باشد");

    if (!form.ref_type || !form.ref_id)
      return toast.error("نوع منبع و نام منبع الزامی است");

    try {
      await api.post("/journals", {
        ...form,
        amount: Number(form.amount),
        ref_id: Number(form.ref_id),
      });

      toast.success("ذخیره شد");

      setForm({
        journal_date: "",
        description: "",
        entry_type: "debit",
        amount: "",
        ref_type: "",
        ref_id: "",
      });

      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "خطا در ذخیره");
    }
  };

  const inputClass =
    "w-full rounded-xl px-3 py-1 text-sm bg-[#122b55] text-white border border-[#1e3a8a]";

  /* ================= Render ================= */
  return (
    <MainLayoutjur>
      <ToastContainer />
      <h2 style={{ textAlign: "center" }}>ثبت و مدیریت محاسبات</h2>

      <div className="form-container mb-6 flex gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={inputClass}
        >
          <option value="">همه نوع‌ها</option>
          {Object.keys(ENTRY_TYPE_FA).map((t) => (
            <option key={t} value={t}>
              {ENTRY_TYPE_FA[t]}
            </option>
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
            {Object.keys(ENTRY_TYPE_FA).map((t) => (
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
            {refTypes.map((t) => (
              <option key={t} value={t}>
                {REF_TYPE_FA[t] ?? t}
              </option>
            ))}
          </select>

          <select
            name="ref_id"
            value={form.ref_id}
            onChange={handleChange}
            disabled={!form.ref_type}
            className={inputClass}
          >
            <option value="">نام منبع</option>
            {filteredRefs.map((r) => (
              <option key={r.id ?? r.reg_id} value={r.id ?? r.reg_id}>
                {r.full_name ?? r.display_name ?? `شماره ${r.id ?? r.reg_id}`}
              </option>
            ))}
          </select>

          <button className="bg-blue-700 text-white rounded-xl py-2">
            ثبت
          </button>
        </form>
      </div>

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
              (() => {
                let lastKey = null;
                let groupIndex = -1;

                return currentRows.map((j) => {
                  const currentKey = `${j.ref_type}_${j.ref_id}`;

                  if (currentKey !== lastKey) {
                    groupIndex++;
                    lastKey = currentKey;
                  }

                  const ref = getRef(j.ref_type, j.ref_id);

                  let name =
                    ref?.full_name ??
                    ref?.display_name ??
                    ref?.customer_name ??
                    ref?.supplier_name ??
                    "-";

                  let backgroundColor = "#123a70";

                  if (
                    ["doctor", "patient", "supplier"].includes(j.ref_type)
                  ) {
                    backgroundColor = groupIndex % 2 === 0 ? "#1b3a70" : "#0f2f55";
                  } else {
                    backgroundColor = groupIndex % 2 === 0 ? "#123a70" : "#0f2f66";
                  }

                  return (
                    <tr key={j.id} style={{ backgroundColor, transition: "0.2s" }}>
                      <td>{j.journal_date}</td>
                      <td>{ENTRY_TYPE_FA[j.entry_type]}</td>
                      <td>{j.description || "-"}</td>
                      <td>{j.amount}</td>
                      <td>{REF_TYPE_FA[j.ref_type]}</td>
                      <td>{name}</td>
                    </tr>
                  );
                });
              })()
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  نتیجه‌ای یافت نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-4">
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

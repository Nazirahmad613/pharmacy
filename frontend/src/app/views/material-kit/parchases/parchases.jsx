 import { useState, useEffect } from "react";
import MainLayoutpur from "../../../../components/MainLayoutpur";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";

export default function ParchaseForm() {
  const { api } = useAuth();

  const [parchaseDate, setParchaseDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [medications, setMedications] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [totalPurchase, setTotalPurchase] = useState(0);
  const [par_paid, setParPaid] = useState(0);
  const [due_par, setDuePar] = useState(0);

  const [formItem, setFormItem] = useState({
    category_id: "",
    med_id: "",
    supplier_id: "",
    type: "",
    quantity: "",
    unit_price: "",
    total_price: 0,
    exp_date: "",
  });

  const [purchasedItems, setPurchasedItems] = useState([]);

  // ================= محاسبه مجموع خرید =================
  useEffect(() => {
    const sum = purchasedItems.reduce(
      (t, i) => t + Number(i.total_price || 0),
      0
    );
    setTotalPurchase(sum);
  }, [purchasedItems]);

  // ================= محاسبه باقی‌مانده =================
  useEffect(() => {
    const due = Number(totalPurchase) - Number(par_paid || 0);
    setDuePar(due >= 0 ? due : 0);
  }, [totalPurchase, par_paid]);

  // ================= لود داده‌ها =================
  useEffect(() => {
    api.get("/categories").then(res => setCategories(res.data.data ?? res.data));
    api.get("/medications").then(res => setMedications(res.data.data ?? res.data));
    api.get("/suppliers").then(res => setSuppliers(res.data.suppliers ?? res.data.data ?? res.data));
  }, [api]);

  // ================= فیلترها =================
  const filteredMedications = medications.filter(
    m => Number(m.category_id) === Number(formItem.category_id)
  );

  const selectedMedication = medications.find(
    m => Number(m.med_id) === Number(formItem.med_id)
  );

  const filteredSuppliers = selectedMedication
    ? suppliers.filter(s => {
        const sup = selectedMedication.supplier_id;
        if (Array.isArray(sup)) return sup.includes(s.supplier_id);
        return Number(sup) === Number(s.supplier_id);
      })
    : [];

  // ================= تغییر فیلد =================
  const handleChange = (field, value) => {
    let updated = { ...formItem, [field]: value };

    if (field === "category_id") {
      updated.med_id = "";
      updated.supplier_id = "";
      updated.type = "";
    }

    if (field === "med_id") {
      const med = medications.find(m => Number(m.med_id) === Number(value));
      updated.type = med?.type ?? "";
      updated.unit_price = med?.unit_price ?? "";
      updated.supplier_id = "";
    }

    const qty = Number(field === "quantity" ? value : updated.quantity || 0);
    const price = Number(field === "unit_price" ? value : updated.unit_price || 0);
    updated.total_price = qty * price;

    setFormItem(updated);
  };

  // ================= Enter =================
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (
      !formItem.category_id ||
      !formItem.med_id ||
      !formItem.supplier_id ||
      !formItem.quantity ||
      !formItem.unit_price ||
      !formItem.exp_date
    ) {
      toast.error("❌ لطفاً تمام فیلدها را پر کنید");
      return;
    }

    setPurchasedItems([...purchasedItems, { ...formItem }]);

    setFormItem({
      category_id: "",
      med_id: "",
      supplier_id: "",
      type: "",
      quantity: "",
      unit_price: "",
      total_price: 0,
      exp_date: "",
    });
  };

  // ================= حذف آیتم =================
  const handleRemoveItem = (index) => {
    setPurchasedItems(purchasedItems.filter((_, i) => i !== index));
  };

  // ================= ثبت خرید =================
  const handleSavePurchase = async () => {
    if (purchasedItems.length === 0) {
      toast.error("❌ حداقل یک آیتم اضافه کنید");
      return;
    }

    const payload = {
      parchase_date: parchaseDate || new Date().toISOString().split("T")[0],
      par_paid,
      items: purchasedItems,
    };

    try {
      await api.post("/parchases", payload);
      toast.success("✅ خرید با موفقیت ثبت شد");

      setPurchasedItems([]);
      setParPaid(0);
      setDuePar(0);
      setTotalPurchase(0);
      setParchaseDate("");
    } catch (err) {
      console.error(err);
      toast.error("❌ خطا در ثبت خرید");
    }
  };

  return (
    <MainLayoutpur>
      <ToastContainer />

      {/* ================= اطلاعات اصلی ================= */}
      <div className="form-container">
        <h2 align="center"> ثبت خرید دارو </h2>

        <label>تاریخ خرید</label>
        <input type="date" value={parchaseDate} onChange={e => setParchaseDate(e.target.value)} />

        <label>مجموع خرید</label>
        <input type="number" value={totalPurchase} readOnly />

        <label>مبلغ پرداخت شده</label>
        <input type="number" value={par_paid} onChange={e => setParPaid(Number(e.target.value))} />

        <label>مبلغ باقی‌مانده</label>
        <input type="number" value={due_par} readOnly />
      </div>

      {/* ================= فرم آیتم‌ها ================= */}
      <form
        className="medication-page"
        style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        onKeyDown={handleKeyDown}
      >
        <div>
          <label>کتگوری</label>
          <select value={formItem.category_id} onChange={e => handleChange("category_id", e.target.value)}>
            <option value="">-- انتخاب --</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>دوا</label>
          <select value={formItem.med_id} onChange={e => handleChange("med_id", e.target.value)}>
            <option value="">-- انتخاب --</option>
            {filteredMedications.map(m => (
              <option key={m.med_id} value={m.med_id}>{m.gen_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>حمایت‌کننده</label>
          <select value={formItem.supplier_id} onChange={e => handleChange("supplier_id", e.target.value)}>
            <option value="">-- انتخاب --</option>
            {filteredSuppliers.map(s => (
              <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name ?? s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>نوع دوا</label>
          <input type="text" value={formItem.type} readOnly />
        </div>

        <div>
          <label>تعداد</label>
          <input type="number" value={formItem.quantity} onChange={e => handleChange("quantity", e.target.value)} />
        </div>

        <div>
          <label>قیمت واحد</label>
          <input type="number" value={formItem.unit_price} onChange={e => handleChange("unit_price", e.target.value)} />
        </div>

        <div>
          <label>قیمت مجموعی</label>
          <input type="number" value={formItem.total_price} readOnly />
        </div>

        <div>
          <label>تاریخ انقضا</label>
          <input type="date" value={formItem.exp_date} onChange={e => handleChange("exp_date", e.target.value)} />
        </div>
      </form>

      {/* ================= جدول آیتم‌ها ================= */}
      <h4>موارد اضافه شده</h4>
      {purchasedItems.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#04032aff", color: "#ffffff" }}>
              <th style={{ padding: "8px", textAlign: "center" }}>شماره</th>
              <th style={{ padding: "8px", textAlign: "center" }}>نوع دوا</th>
              <th style={{ padding: "8px", textAlign: "center" }}>تعداد</th>
              <th style={{ padding: "8px", textAlign: "right" }}>قیمت واحد</th>
              <th style={{ padding: "8px", textAlign: "right" }}>قیمت مجموعی</th>
              <th style={{ padding: "8px", textAlign: "center" }}>تاریخ انقضا</th>
              <th style={{ padding: "8px", textAlign: "center" }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {purchasedItems.map((item, idx) => (
              <tr key={idx} style={{ backgroundColor: "#210733", color: "#ffffff" }}>
                <td style={{ padding: "8px", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{item.type}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{item.quantity}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{item.unit_price}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{item.total_price}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{item.exp_date}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      padding: "6px 12px",
                      fontSize: "14px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = "#ef4444")}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
        <button
          onClick={handleSavePurchase}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "12px 30px",
            fontSize: "18px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            transition: "background-color 0.3s",
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = "#2563eb")}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = "#3b82f6")}
        >
          ثبت خرید
        </button>
      </div>
    </MainLayoutpur>
  );
}

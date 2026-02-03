import { useState, useEffect } from "react";
import MainLayoutpur from "../../../../components/MainLayoutpur";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";

export default function SaleForm() {
  const { api } = useAuth();

  const [saleDate, setSaleDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [medications, setMedications] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]); // مشتری‌ها از جدول registration

  const [discount, setDiscount] = useState(0);
  const [totalSale, setTotalSale] = useState(0);
  const [netSales, setNetSales] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("پرداخت نشده");

  const [formItem, setFormItem] = useState({
    cust_id: "",
    category_id: "",
    med_id: "",
    supplier_id: "",
    type: "",
    quantity: "",
    unit_sales: "",
    total_sales: 0,
    exp_date: "",
  });

  const [saleItems, setSaleItems] = useState([]);

  // ================= محاسبه مجموع آیتم‌ها =================
  useEffect(() => {
    const sum = saleItems.reduce((t, i) => t + Number(i.total_sales || 0), 0);
    setTotalSale(sum);
  }, [saleItems]);

  // ================= محاسبه فروش خالص =================
  useEffect(() => {
    const net = Number(totalSale) - Number(discount || 0);
    setNetSales(net >= 0 ? net : 0);
  }, [totalSale, discount]);

  // ================= محاسبه باقی‌مانده و وضعیت پرداخت =================
  useEffect(() => {
    const rem = Number(netSales) - Number(totalPaid || 0);
    setRemaining(rem >= 0 ? rem : 0);

    if (Number(totalPaid) === 0) setPaymentStatus("پرداخت نشده");
    else if (Number(totalPaid) < Number(netSales)) setPaymentStatus("پرداخت جزئی");
    else setPaymentStatus("پرداخت کامل شده");
  }, [netSales, totalPaid]);

  // ================= لود داده‌ها =================
  useEffect(() => {
    api.get("/categories").then(res => setCategories(res.data.data ?? res.data));
    api.get("/medications").then(res => setMedications(res.data.data ?? res.data));
    api.get("/suppliers").then(res => setSuppliers(res.data.suppliers ?? res.data.data ?? res.data));

    // ================= مشتری‌ها از جدول registration =================
    api.get("/customers")
      .then(res => {
        const data = res.data.data ?? res.data ?? [];
        setCustomers(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Error loading customers:", err);
        setCustomers([]); // همیشه آرایه باشد
      });
  }, [api]);

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

  // ================= تغییر فیلدهای آیتم =================
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
      updated.unit_sales = med?.unit_sales ?? "";
      updated.supplier_id = "";
    }

    const qty = Number(field === "quantity" ? value : updated.quantity || 0);
    const price = Number(field === "unit_sales" ? value : updated.unit_sales || 0);
    updated.total_sales = qty * price;

    setFormItem(updated);
  };

  // ================= اضافه کردن آیتم با Enter =================
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (
      !formItem.cust_id ||
      !formItem.category_id ||
      !formItem.med_id ||
      !formItem.supplier_id ||
      !formItem.quantity ||
      !formItem.unit_sales ||
      !formItem.exp_date
    ) {
      toast.error("❌ لطفاً تمام فیلدها را درست پر کنید");
      return;
    }

    setSaleItems([...saleItems, { ...formItem, id: Date.now() }]); // id موقت برای key
    setFormItem({
      cust_id: formItem.cust_id,
      category_id: "",
      med_id: "",
      supplier_id: "",
      type: "",
      quantity: "",
      unit_sales: "",
      total_sales: 0,
      exp_date: "",
    });
  };

  const handleRemoveItem = (id) => {
    setSaleItems(saleItems.filter(item => item.id !== id));
  };

  // ================= ثبت فروش =================
  const handleSaveSale = async () => {
    if (saleItems.length === 0) {
      toast.error("❌ حداقل یک آیتم اضافه کنید");
      return;
    }

    const payload = {
      sales_date: saleDate || new Date().toISOString().split("T")[0],
      cust_id: formItem.cust_id,
      discount,
      total_sales: totalSale,
      net_sales: netSales,
      total_paid: totalPaid,
      items: saleItems.map(item => ({
        category_id: item.category_id,
        med_id: item.med_id,
        supplier_id: item.supplier_id,
        type: item.type,
        quantity: Number(item.quantity),
        unit_sales: Number(item.unit_sales),
        total_sales: Number(item.total_sales),
        exp_date: item.exp_date,
      })),
    };

    try {
      await api.post("/sales", payload);
      toast.success("✅ فروش با موفقیت ثبت شد");

      // ریست فرم
      setSaleItems([]);
      setDiscount(0);
      setTotalSale(0);
      setNetSales(0);
      setTotalPaid(0);
      setRemaining(0);
      setPaymentStatus("پرداخت نشده");
      setSaleDate("");
      setFormItem({
        cust_id: "",
        category_id: "",
        med_id: "",
        supplier_id: "",
        type: "",
        quantity: "",
        unit_sales: "",
        total_sales: 0,
        exp_date: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ خطا در ثبت فروش");
    }
  };

  return (
    <MainLayoutpur>
      <ToastContainer />

      {/* ================= اطلاعات اصلی ================= */}
      <div className="form-container">
        <h2 align="center"> ثبت فروشات </h2>

        <label>تاریخ فروش</label>
        <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} />

        <label>مشتری</label>
        <select value={formItem.cust_id} onChange={e => handleChange("cust_id", e.target.value)}>
          <option value="">-- انتخاب مشتری --</option>
          {Array.isArray(customers) &&
            customers.map(c => (
              <option key={c.id} value={c.id}>{c.name ?? c.full_name}</option>
            ))
          }
        </select>

        <label>مجموع فروش</label>
        <input type="number" value={totalSale} readOnly />

        <label>تخفیف</label>
        <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />

        <label>فروش خالص</label>
        <input type="number" value={netSales} readOnly />

        <label>پرداخت اولیه</label>
        <input type="number" value={totalPaid} onChange={e => setTotalPaid(Number(e.target.value))} />

        <label>باقی‌مانده</label>
        <input type="number" value={remaining} readOnly />

        <label>وضعیت پرداخت</label>
        <input type="text" value={paymentStatus} readOnly />
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
            <option value="">-- انتخاب کتگوری --</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>دوا</label>
          <select value={formItem.med_id} onChange={e => handleChange("med_id", e.target.value)}>
            <option value="">-- انتخاب دوا --</option>
            {filteredMedications.map(m => (
              <option key={m.med_id} value={m.med_id}>{m.gen_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>حمایت‌کننده</label>
          <select value={formItem.supplier_id} onChange={e => handleChange("supplier_id", e.target.value)}>
            <option value="">-- انتخاب حمایت‌کننده --</option>
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
          <input type="number" value={formItem.unit_sales} onChange={e => handleChange("unit_sales", e.target.value)} />
        </div>

        <div>
          <label>قیمت مجموعی</label>
          <input type="number" value={formItem.total_sales} readOnly />
        </div>

        <div>
          <label>تاریخ انقضا</label>
          <input type="date" value={formItem.exp_date} onChange={e => handleChange("exp_date", e.target.value)} />
        </div>
      </form>

      {/* ================= لیست آیتم‌ها ================= */}
      <h4>موارد اضافه شده</h4>
      {saleItems.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#04032aff" }}>
              <th style={{ padding: "8px", textAlign:"center" }}>شماره</th>
              <th style={{ padding: "8px", textAlign:"center" }}>نوع دوا</th>
              <th style={{ padding: "8px", textAlign:"center" }}>تعداد</th>
              <th style={{ padding: "8px", textAlign:"center" }}>قیمت واحد</th>
              <th style={{ padding: "8px", textAlign:"center" }}>قیمت مجموعی</th>
              <th style={{ padding: "8px", textAlign:"center" }}>تاریخ انقضا</th>
              <th style={{ padding: "8px", textAlign:"center" }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {saleItems.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ padding: "8px", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ padding: "8px", textAlign:"center"}}>{item.type}</td>
                <td style={{ padding: "8px", textAlign:"center" }}>{item.quantity}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{item.unit_sales}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{item.total_sales}</td>
                <td style={{ padding: "8px", textAlign:"center" }}>{item.exp_date}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
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

      {/* ================= دکمه ثبت فروش ================= */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
        <button
          onClick={handleSaveSale}
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
          ثبت فروش
        </button>
      </div>
    </MainLayoutpur>
  );
}

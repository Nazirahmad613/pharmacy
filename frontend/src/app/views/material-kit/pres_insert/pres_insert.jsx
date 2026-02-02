 import { useState, useEffect } from "react";
import MainLayoutpur from "../../../../components/MainLayoutpur";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";

export default function PrescriptionForm() {
  const { api } = useAuth();

  // ----- قسمت اول -----
  const [presNum, setPresNum] = useState("");
  const [paName, setPaName] = useState("");
  const [paAge, setPaAge] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [medications, setMedications] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // ----- قسمت دوم (آیتم‌ها) -----
  const [formItem, setFormItem] = useState({
    category_id: "",
    med_id: "",
    supplier_id: "",
    quantity: "",
    unit_price: "",
    total_price: 0,
    type: "",
    dosage: "",
    remarks: ""
  });

  const [prescriptionItems, setPrescriptionItems] = useState([]);

  // محاسبه مجموع کل
  useEffect(() => {
    const sum = prescriptionItems.reduce((t, i) => t + Number(i.total_price), 0);
    setTotalAmount(sum);
  }, [prescriptionItems]);

  useEffect(() => {
    setNetAmount(totalAmount - discount);
  }, [totalAmount, discount]);

  // ----- لود داده‌ها -----
  useEffect(() => {
    api.get("/doctors")
      .then(res => {
        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (Array.isArray(res.data?.data)) data = res.data.data;
        else if (Array.isArray(res.data?.doctors)) data = res.data.doctors;
        setDoctors(data.filter(d => d.doc_id && d.doc_name));
      })
      .catch(() => setDoctors([]));

    api.get("/categories").then(res => setCategories(res.data.data ?? res.data)).catch(console.error);
    api.get("/medications").then(res => setMedications(res.data.data ?? res.data)).catch(console.error);
    api.get("/suppliers").then(res => setSuppliers(res.data.suppliers ?? res.data.data ?? res.data)).catch(console.error);
  }, [api]);

  // فیلتر دواها و حمایت‌کننده‌ها
  const filteredMedications = medications.filter(
    (m) => Number(m.category_id) === Number(formItem.category_id)
  );
  const selectedMedication = medications.find(
    (m) => Number(m.med_id) === Number(formItem.med_id)
  );
  const filteredSuppliers = selectedMedication
    ? suppliers.filter(
        (s) =>
          selectedMedication.supplier_id === s.supplier_id ||
          selectedMedication.supplier_id?.includes?.(s.supplier_id)
      )
    : [];

  // تغییر فیلدهای فرم آیتم
  const handleChange = (field, value) => {
    let updated = { ...formItem, [field]: value };

    if (field === "category_id") updated.med_id = "";
    if (field === "category_id" || field === "med_id") updated.supplier_id = "";

    // اگر دوا تغییر کرد، نوع دوا از medications پر شود
    if (field === "med_id") {
      const med = medications.find(m => Number(m.med_id) === Number(value));
      updated.type = med?.type ?? "";
      updated.unit_price = med?.unit_price ?? 0;
    }

    const quantity = field === "quantity" ? Number(value) : Number(updated.quantity);
    const unitPrice = field === "unit_price" ? Number(value) : Number(updated.unit_price);
    updated.total_price = quantity * unitPrice;

    setFormItem(updated);
  };

  // اضافه کردن آیتم هنگام Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        !formItem.category_id ||
        !formItem.med_id ||
        !formItem.supplier_id ||
        Number(formItem.quantity) <= 0 ||
        Number(formItem.unit_price) <= 0
      ) {
        toast.error("❌ لطفاً تمام فیلدها را درست پر کنید", { position: "top-right", autoClose: 3000, theme: "dark" });
        return;
      }

      setPrescriptionItems([...prescriptionItems, formItem]);
      setFormItem({
        category_id: "",
        med_id: "",
        supplier_id: "",
        quantity: "",
        unit_price: 0,
        total_price: 0,
        type: "",
        dosage: "",
        remarks: ""
      });
    }
  };

  // حذف آیتم
  const handleRemoveItem = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  // ثبت نسخه
  const handleSavePrescription = async () => {
    if (!doctorId) {
      toast.error("❌ لطفاً داکتر را انتخاب کنید");
      return;
    }
    if (!presNum || !paName || !paAge) {
      toast.error("❌ شماره نسخه، اسم مریض و سن مریض را وارد کنید");
      return;
    }
    if (prescriptionItems.length === 0) {
      toast.error("❌ حداقل یک دوا اضافه کنید");
      return;
    }

    const payload = {
      pres_num: presNum,
      pa_name: paName,
      pa_age: parseFloat(paAge),
      doc_id: doctorId,
      pres_date: prescriptionDate || new Date().toISOString().split("T")[0],
      total_amount: totalAmount,
      discount,
      net_amount: netAmount,
      items: prescriptionItems,
    };

    try {
      await api.post("/prescriptions", payload);
      toast.success("✅ نسخه با موفقیت ثبت شد");

      // ریست فرم
      setPresNum("");
      setPaName("");
      setPaAge("");
      setDoctorId("");
      setPrescriptionDate("");
      setDiscount(0);
      setPrescriptionItems([]);
      setFormItem({
        category_id: "",
        med_id: "",
        supplier_id: "",
        quantity: "",
        unit_price: 0,
        total_price: 0,
        type: "",
        dosage: "",
        remarks: ""
      });
    } catch (err) {
      console.error(err.response?.data ?? err.message);
      toast.error("❌ خطا در ثبت نسخه");
    }
  };

  return (
    <MainLayoutpur>
      
      <div className="form-container" style={{  flexWrap: "wrap" }}>
          <h2 align="center" >ثبت نسخه </h2>
        <div>
          <label>شماره نسخه</label>
          <input type="text" value={presNum} onChange={(e) => setPresNum(e.target.value)} />
        </div>
        <div>
          <label>اسم مریض</label>
          <input type="text" value={paName} onChange={(e) => setPaName(e.target.value)} />
        </div>
        <div>
          <label>سن مریض</label>
          <input type="number" step="0.1" value={paAge} onChange={(e) => setPaAge(e.target.value)} />
        </div>
        <div>
          <label>داکتر</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">-- انتخاب داکتر --</option>
            {doctors.map(doc => (
              <option key={doc.doc_id} value={doc.doc_id}>{doc.doc_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>تاریخ نسخه</label>
          <input type="date" value={prescriptionDate} onChange={(e) => setPrescriptionDate(e.target.value)} />
        </div>
        <div>
          <label>مجموع کل</label>
          <input type="number" value={totalAmount} readOnly />
        </div>
        <div>
          <label>تخفیف</label>
          <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </div>
        <div>
          <label>مبلغ خالص</label>
          <input type="number" value={netAmount} readOnly />
        </div>
      </div>
            
      {/* ----- قسمت دوم (فرم آیتم + جدول) ----- */}
      <form className="medication-page" style={{ display: "flex", gap: "2px", flexWrap: "wrap",fontSize:"20px" }} onKeyDown={handleKeyDown}>
        <div>
          <label>کتگوری</label>
          <select value={formItem.category_id} onChange={(e) => handleChange("category_id", e.target.value)}>
            <option value="">-- انتخاب کتگوری --</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>دوا</label>
          <select value={formItem.med_id} onChange={(e) => handleChange("med_id", e.target.value)}>
            <option value="">-- انتخاب دوا --</option>
            {filteredMedications.map((med) => (
              <option key={med.med_id} value={med.med_id}>{med.gen_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>حمایت‌کننده</label>
          <select value={formItem.supplier_id} onChange={(e) => handleChange("supplier_id", e.target.value)}>
            <option value="">-- انتخاب حمایت‌کننده --</option>
            {filteredSuppliers.map((sup) => (
              <option key={sup.supplier_id} value={sup.supplier_id}>{sup?.supplier_name ?? sup?.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>نوع دوا</label>
          <input type="text" value={formItem.type} readOnly style={{ backgroundColor: "#f3f3f3", cursor: "not-allowed" }} />
        </div>

        <div>
          <label>مقدار مصرف</label>
          <input type="text" value={formItem.dosage} onChange={(e) => handleChange("dosage", e.target.value)} />
        </div>

        <div>
          <label>تعداد</label>
          <input type="number" value={formItem.quantity} onChange={(e) => handleChange("quantity", e.target.value)} />
        </div>

        <div>
          <label>قیمت واحد</label>
          <input type="number" value={formItem.unit_price} onChange={(e) => handleChange("unit_price", e.target.value)} />
        </div>

        <div>
          <label>قیمت مجموعی</label>
          <input type="number" value={formItem.total_price} readOnly style={{ backgroundColor: "#f3f3f3", cursor: "not-allowed", fontWeight: "bold" }} />
        </div>

        <div>
          <label>ملاحظات</label>
          <input type="text" value={formItem.remarks} onChange={(e) => handleChange("remarks", e.target.value)} />
        </div>
      </form>

      <h4>موارد اضافه شده </h4>
      {prescriptionItems.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "0.5fr 2fr 2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.8fr",
            fontWeight: "600",
            fontSize: "20px",
            backgroundColor: "#080e2e",
            color: "white",
            padding: "6px 8px",
            alignItems: "center"
          }}>
            <span></span>
            <span>کتگوری</span>
            <span>دوا</span>
            <span>حمایت‌کننده</span>
            <span>نوع دوا</span>
            <span>مقدار مصرف</span>
            <span>تعداد</span>
            <span>قیمت واحد</span>
            <span>قیمت مجموعی</span>
            <span>ملاحظات</span>
            <span>عملیات</span>
          </div>

          {prescriptionItems.map((item, idx) => {
            const med = medications.find(m => m.med_id == item.med_id);
            const cat = categories.find(c => c.category_id == item.category_id);
            const sup = suppliers.find(s => s.supplier_id == item.supplier_id);

            return (
              <div key={idx} style={{
                display: "grid",
                gridTemplateColumns: "0.5fr 2fr 2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.8fr",
                backgroundColor: "#100a25",
                padding: "6px 8px",
                borderRadius: "4px",
                alignItems: "center",
                fontSize: "13px",
                gap: "4px"
              }}>
                <span>{idx + 1}</span>
                <span>{cat?.category_name ?? "-"}</span>
                <span>{med?.gen_name ?? "-"}</span>
                <span>{sup?.supplier_name ?? sup?.name ?? "-"}</span>
                <span>{item.type}</span>
                <span>{item.dosage}</span>
                <span>{item.quantity}</span>
                <span>{item.unit_price}</span>
                <span>{item.total_price}</span>
                <span>{item.remarks}</span>
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
                >
                  حذف
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p>هیچ موارد اضافه نشده است</p>
      )}

      <button onClick={handleSavePrescription}     style={{
      backgroundColor: "#311f79",
      color: "white",
      padding: "12px 30px",
      fontSize: "18px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      textAlign: "center",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      transition: "background-color 0.3s",
      marginRight:"600px",
      marginTop:"50px",
    }}   >ثبت نسخه</button>
      <ToastContainer />
    </MainLayoutpur>
  );
}

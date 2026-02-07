import { useState, useEffect } from "react";
import MainLayoutpur from "../../../../components/MainLayoutpur";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";

export default function PrescriptionForm() {
  const { api } = useAuth();

  // ===== مریض و نسخه =====
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientInfo, setPatientInfo] = useState({
    age: "",
    phone: "",
    blood_group: "",
    reg_id: "",
    pres_num: ""
  });

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctors, setDoctors] = useState([]);

  const [prescriptionDate, setPrescriptionDate] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  const [categories, setCategories] = useState([]);
  const [medications, setMedications] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // ===== آیتم =====
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

  // ===== محاسبات =====
  useEffect(() => {
    const sum = prescriptionItems.reduce(
      (t, i) => t + Number(i.total_price),
      0
    );
    setTotalAmount(sum);
  }, [prescriptionItems]);

  useEffect(() => {
    setNetAmount(totalAmount - discount);
  }, [totalAmount, discount]);

  // ===== لود دیتا =====
  useEffect(() => {
    api.get("/registrations").then(res => {
      const data = res.data.data ?? res.data ?? [];
      setPatients(data.filter(r => r.reg_type === "patient"));
      setDoctors(data.filter(r => r.reg_type === "doctor"));
      setSuppliers(data.filter(r => r.reg_type === "supplier"));
    });

    api.get("/categories").then(res =>
      setCategories(res.data.data ?? res.data)
    );
    api.get("/medications").then(res =>
      setMedications(res.data.data ?? res.data)
    );
  }, [api]);

  // ===== معلومات مریض =====
  useEffect(() => {
    if (!selectedPatientId) return;
    const p = patients.find(x => x.reg_id == selectedPatientId);
    if (!p) return;

    setPatientInfo({
      age: p.age ?? "",
      phone: p.phone ?? "",
      blood_group: p.blood_group ?? "",
      reg_id: p.reg_id ?? "",
      pres_num: p.pres_num ?? ""
    });
  }, [selectedPatientId, patients]);

  // ===== فیلتر =====
  const filteredMedications = medications.filter(
    m => Number(m.category_id) === Number(formItem.category_id)
  );

  const selectedMedication = medications.find(
    m => Number(m.med_id) === Number(formItem.med_id)
  );

  const filteredSuppliers = selectedMedication
    ? suppliers.filter(s => s.reg_id == selectedMedication.supplier_id)
    : [];

  // ===== تغییر آیتم =====
  const handleChange = (field, value) => {
    let updated = { ...formItem, [field]: value };

    if (field === "category_id") {
      updated.med_id = "";
      updated.supplier_id = "";
    }

    if (field === "med_id") {
      const med = medications.find(m => m.med_id == value);
      updated.type = med?.type ?? "";
      updated.unit_price = med?.unit_price ?? 0;
      updated.supplier_id = "";
    }

    updated.total_price =
      Number(updated.quantity) * Number(updated.unit_price);

    setFormItem(updated);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const addItem = () => {
    if (
      !formItem.category_id ||
      !formItem.med_id ||
      !formItem.supplier_id ||
      Number(formItem.quantity) <= 0
    ) {
      toast.error("❌ معلومات آیتم کامل نیست");
      return;
    }

    setPrescriptionItems([...prescriptionItems, formItem]);
    setFormItem({
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
  };

  const handleRemoveItem = index => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  // ===== ثبت نسخه =====
  const handleSavePrescription = async () => {
    if (!selectedPatientId || !selectedDoctorId || prescriptionItems.length === 0) {
      toast.error("❌ معلومات نسخه ناقص است");
      return;
    }

    await api.post("/prescriptions", {
      patient_id: selectedPatientId,
      pres_num: patientInfo.pres_num,
      patient_age: patientInfo.age,
      patient_phone: patientInfo.phone,
      patient_reg_id: patientInfo.reg_id,
      patient_blood_group: patientInfo.blood_group,
      doc_id: selectedDoctorId,
      pres_date: prescriptionDate || new Date().toISOString().slice(0, 10),
      total_amount: totalAmount,
      discount,
      net_amount: netAmount,
      items: prescriptionItems
    });

    toast.success("✅ نسخه موفقانه ثبت شد");
  };

  return (
    <MainLayoutpur>
      <ToastContainer />

      {/* ===== معلومات نسخه ===== */}
      <div className="form-container" style={{ flexWrap: "wrap" }}>
        <h2 align="center">ثبت نسخه</h2>
 <div>
  <label>شماره نسخه</label>
  <input
    value={patientInfo.pres_num}
    onChange={e =>
      setPatientInfo({ ...patientInfo, pres_num: e.target.value })
    }
    placeholder="شماره نسخه را وارد کنید"
  />
</div>


        <div>
          <label>مریض</label>
          <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
            <option value="">-- انتخاب مریض --</option>
            {patients.map(p => (
              <option key={p.reg_id} value={p.reg_id}>
                {p.full_name ?? p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>سن</label>
          <input value={patientInfo.age} readOnly />
        </div>

        <div>
          <label>شماره تماس</label>
          <input value={patientInfo.phone} readOnly />
        </div>

        <div>
          <label>آی‌دی مریض</label>
          <input value={patientInfo.reg_id} readOnly />
        </div>

        <div>
          <label>گروه خون</label>
          <input value={patientInfo.blood_group} readOnly />
        </div>

        <div>
          <label>داکتر</label>
          <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}>
            <option value="">-- انتخاب داکتر --</option>
            {doctors.map(d => (
              <option key={d.reg_id} value={d.reg_id}>
                {d.full_name ?? d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>تاریخ نسخه</label>
          <input type="date" value={prescriptionDate} onChange={e => setPrescriptionDate(e.target.value)} />
        </div>

        <div>
          <label>مجموع</label>
          <input value={totalAmount} readOnly />
        </div>

        <div>
          <label>تخفیف</label>
          <input value={discount} onChange={e => setDiscount(+e.target.value)} />
        </div>

        <div>
          <label>خالص</label>
          <input value={netAmount} readOnly />
        </div>
      </div>

      {/* ===== فرم آیتم ===== */}
      <form className="medication-page"
        style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "18px" }}
        onKeyDown={handleKeyDown}
      >
        {[["کتگوری", <select value={formItem.category_id} onChange={e => handleChange("category_id", e.target.value)}>
          <option value="">انتخاب</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
        </select>],

        ["دوا", <select value={formItem.med_id} onChange={e => handleChange("med_id", e.target.value)}>
          <option value="">انتخاب</option>
          {filteredMedications.map(m => <option key={m.med_id} value={m.med_id}>{m.gen_name}</option>)}
        </select>],

        ["حمایت‌کننده", <select value={formItem.supplier_id} onChange={e => handleChange("supplier_id", e.target.value)}>
          <option value="">انتخاب</option>
          {filteredSuppliers.map(s => <option key={s.reg_id} value={s.reg_id}>{s.full_name ?? s.name}</option>)}
        </select>],

        ["نوع دوا", <input value={formItem.type} readOnly />],
        ["مقدار مصرف", <input value={formItem.dosage} onChange={e => handleChange("dosage", e.target.value)} />],
        ["تعداد", <input type="number" value={formItem.quantity} onChange={e => handleChange("quantity", e.target.value)} />],
        ["قیمت واحد", <input type="number" value={formItem.unit_price} onChange={e => handleChange("unit_price", e.target.value)} />],
        ["قیمت مجموعی", <input value={formItem.total_price} readOnly />],
        ["ملاحظات", <input value={formItem.remarks} onChange={e => handleChange("remarks", e.target.value)} />]
        ].map(([label, input], i) => (
          <div key={i}>
            <label>{label}</label>
            {input}
          </div>
        ))}
      </form>

      <h4>موارد اضافه شده</h4>
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
            const sup = suppliers.find(s => s.reg_id == item.supplier_id);

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
                <span>{sup?.full_name ?? sup?.name ?? "-"}</span>
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

      <button onClick={handleSavePrescription} style={{
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
        marginRight: "600px",
        marginTop: "50px",
      }}>ثبت نسخه</button>
    </MainLayoutpur>
  );
}

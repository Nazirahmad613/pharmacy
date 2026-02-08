import { useState, useEffect } from "react";
import MainLayoutpur from "../../../../components/MainLayoutpur";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PrescriptionForm() {
  const { api } = useAuth();

  // ===== constant آیتم خالی =====
  const emptyItem = {
    category_id: "",
    med_id: "",
    supplier_id: "",
    quantity: "",
    unit_price: 0,
    total_price: 0,
    type: "",
    dosage: "",
    remarks: ""
  };

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

  const [formItem, setFormItem] = useState(emptyItem);
  const [prescriptionItems, setPrescriptionItems] = useState([]);

  // ===== محاسبات مجموع و خالص =====
  useEffect(() => {
    const sum = prescriptionItems.reduce((t, i) => t + Number(i.total_price), 0);
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

    api.get("/categories").then(res => setCategories(res.data.data ?? res.data));
    api.get("/medications").then(res => setMedications(res.data.data ?? res.data));
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

  // ===== فیلترها =====
  const filteredMedications = medications.filter(
    m => Number(m.category_id) === Number(formItem.category_id)
  );
  const selectedMedication = medications.find(m => Number(m.med_id) === Number(formItem.med_id));
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

    updated.total_price = Number(updated.quantity) * Number(updated.unit_price);
    setFormItem(updated);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const addItem = () => {
    if (!formItem.category_id || !formItem.med_id || !formItem.supplier_id || Number(formItem.quantity) <= 0) {
      toast.error("❌ معلومات آیتم کامل نیست");
      return;
    }

    setPrescriptionItems([...prescriptionItems, formItem]);
    setFormItem(emptyItem);
  };

  const handleRemoveItem = index => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedPatientId("");
    setSelectedDoctorId("");
    setPrescriptionDate("");
    setDiscount(0);
    setTotalAmount(0);
    setNetAmount(0);
    setPrescriptionItems([]);
    setFormItem(emptyItem);
    setPatientInfo({
      age: "",
      phone: "",
      blood_group: "",
      reg_id: "",
      pres_num: ""
    });
  };

  // تبدیل ArrayBuffer به Base64 برای فونت
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // ===== تولید PDF =====
  const generatePDF = async (patientInfo, prescriptionItems, medications, categories, suppliers, totalAmount, discount, netAmount, prescriptionDate, patients, doctors, selectedPatientId, selectedDoctorId) => {
    const doc = new jsPDF();

    // بارگذاری فونت فارسی
    const response = await fetch("/fonts/Vazirmatn-Regular.ttf");
    const fontBuffer = await response.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(fontBuffer);

    doc.addFileToVFS("Vazir-Regular.ttf", fontBase64);
    doc.addFont("Vazir-Regular.ttf", "Vazir", "normal");
    doc.setFont("Vazir");

    // متن بالای PDF
    doc.text(`نسخه شماره: ${patientInfo.pres_num}`, 420, 40, { align: "right" });
    doc.text(
      `تاریخ: ${prescriptionDate || new Date().toLocaleDateString("fa-IR")}`,
      420,
      60,
      { align: "right" }
    );
    doc.text(
      `مریض: ${patients.find(p => p.reg_id == selectedPatientId)?.full_name || "-"}`,
      420,
      80,
      { align: "right" }
    );
    doc.text(`سن: ${patientInfo.age}`, 420, 100, { align: "right" });
    doc.text(`شماره تماس: ${patientInfo.phone}`, 420, 120, { align: "right" });
    doc.text(
      `داکتر: ${doctors.find(d => d.reg_id == selectedDoctorId)?.full_name || "-"}`,
      420,
      140,
      { align: "right" }
    );

    // آماده‌سازی جدول
    const tableColumn = [
      "ردیف",
      "کتگوری",
      "دوا",
      "حمایت‌کننده",
      "نوع دوا",
      "مقدار مصرف",
      "تعداد",
      "قیمت واحد",
      "قیمت مجموعی",
      "ملاحظات",
    ];

    const tableRows = prescriptionItems.map((item, idx) => {
      const med = medications.find(m => m.med_id == item.med_id);
      const cat = categories.find(c => c.category_id == item.category_id);
      const sup = suppliers.find(s => s.reg_id == item.supplier_id);
      return [
        idx + 1,
        cat?.category_name ?? "-",
        med?.gen_name ?? "-",
        sup?.full_name ?? sup?.name ?? "-",
        item.type,
        item.dosage,
        item.quantity,
        item.unit_price,
        item.total_price,
        item.remarks,
      ];
    });

    // ایجاد جدول با نسخه جدید
    autoTable(doc, {
      startY: 160,
      head: [tableColumn],
      body: tableRows,
      styles: { font: "Vazir", fontSize: 10, halign: "right" },
      headStyles: { fillColor: [8, 14, 46], textColor: 255 },
      margin: { right: 20 },
      rtl: true,
    });

    // جمع و خالص
    doc.text(`مجموع: ${totalAmount}`, 420, doc.lastAutoTable.finalY + 20, { align: "right" });
    doc.text(`تخفیف: ${discount}`, 420, doc.lastAutoTable.finalY + 40, { align: "right" });
    doc.text(`خالص: ${netAmount}`, 420, doc.lastAutoTable.finalY + 60, { align: "right" });

    doc.save(`نسخه_${patientInfo.pres_num}.pdf`);
  };

  // ===== ذخیره نسخه و تولید PDF =====
  const handleSavePrescription = async () => {
    if (!selectedPatientId || !selectedDoctorId || prescriptionItems.length === 0) {
      toast.error("❌ معلومات نسخه ناقص است");
      return;
    }

    try {
      // ثبت در دیتابیس
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
        items: prescriptionItems,
      });

      toast.success("✅ نسخه موفقانه ثبت شد");

      resetForm();

      try {
        await generatePDF(
          patientInfo,
          prescriptionItems,
          medications,
          categories,
          suppliers,
          totalAmount,
          discount,
          netAmount,
          prescriptionDate,
          patients,
          doctors,
          selectedPatientId,
          selectedDoctorId
        );
      } catch (pdfError) {
        console.error("PDF error:", pdfError);
        toast.error("❌ خطا در تولید PDF");
      }
    } catch (apiError) {
      console.error("API error:", apiError);
      toast.error("❌ خطا در ثبت نسخه");
    }
  };


  return (
    <MainLayoutpur>
      <ToastContainer />
    
     {/* ===== معلومات نسخه ===== */}
<div style={{ marginBottom: "15px" }}>
  {/* عنوان */}
  <div
    style={{
      backgroundColor: "#080e2e",
      color: "white",
      padding: "8px",
      fontSize: "18px",
      fontWeight: "600",
    }}
  >
    معلومات نسخه
  </div>

  {/* استایل مشترک */}
  {(() => {
    const labelStyle = {
      display: "block",
      marginBottom: "2px",
      fontSize: "12px",
      fontWeight: "500",
    };

    const fieldStyle = {
      width: "5.2cm",
      height: "0.8cm",
      padding: "2px 5px",
      fontSize: "13px",
      borderRadius: "3px",
      border: "1px solid #ccc",
    };

    return (
      <div
        style={{
          backgroundColor: "#100a25",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
          padding: "12px",
          color: "white",
        }}
      >
        {/* شماره نسخه */}
        <div>
          <label style={labelStyle}>شماره نسخه</label>
          <input
            style={fieldStyle}
            value={patientInfo.pres_num}
            onChange={(e) =>
              setPatientInfo({ ...patientInfo, pres_num: e.target.value })
            }
          />
        </div>

        {/* مریض */}
        <div>
          <label style={labelStyle}>مریض</label>
          <select
            style={fieldStyle}
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            <option value="">انتخاب مریض</option>
            {patients.map((p) => (
              <option key={p.reg_id} value={p.reg_id}>
                {p.full_name ?? p.name}
              </option>
            ))}
          </select>
        </div>

        {/* سن */}
        <div>
          <label style={labelStyle}>سن</label>
          <input style={fieldStyle} value={patientInfo.age} readOnly />
        </div>

        {/* شماره تماس */}
        <div>
          <label style={labelStyle}>شماره تماس</label>
          <input style={fieldStyle} value={patientInfo.phone} readOnly />
        </div>

        {/* آی‌دی مریض */}
        <div>
          <label style={labelStyle}>آی‌دی مریض</label>
          <input style={fieldStyle} value={patientInfo.reg_id} readOnly />
        </div>

        {/* گروه خون */}
        <div>
          <label style={labelStyle}>گروه خون</label>
          <input style={fieldStyle} value={patientInfo.blood_group} readOnly />
        </div>

        {/* داکتر */}
        <div>
          <label style={labelStyle}>داکتر</label>
          <select
            style={fieldStyle}
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            <option value="">انتخاب داکتر</option>
            {doctors.map((d) => (
              <option key={d.reg_id} value={d.reg_id}>
                {d.full_name ?? d.name}
              </option>
            ))}
          </select>
        </div>

        {/* تاریخ نسخه */}
        <div>
          <label style={labelStyle}>تاریخ نسخه</label>
          <input
            style={fieldStyle}
            type="date"
            value={prescriptionDate}
            onChange={(e) => setPrescriptionDate(e.target.value)}
          />
        </div>

        {/* مجموع */}
        <div>
          <label style={labelStyle}>مجموع</label>
          <input style={fieldStyle} value={totalAmount} readOnly />
        </div>

        {/* تخفیف */}
        <div>
          <label style={labelStyle}>تخفیف</label>
          <input
            style={fieldStyle}
            value={discount}
            onChange={(e) => setDiscount(+e.target.value)}
          />
        </div>

        {/* خالص */}
        <div>
          <label style={labelStyle}>خالص</label>
          <input style={fieldStyle} value={netAmount} readOnly />
        </div>
      </div>
    );
  })()}
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

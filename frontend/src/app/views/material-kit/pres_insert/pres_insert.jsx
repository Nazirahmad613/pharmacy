  import { useState, useEffect } from "react";
  import MainLayoutjur from "../../../../components/MainLayoutjur";
  import { toast, ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import ReactToPrint from "react-to-print";
  import { useRef } from "react";
  import PrescriptionPrint from "../PrescriptionPrint";
  import { useAuth } from "app/contexts/AuthContext";

  export default function PrescriptionForm() {
    const { api } = useAuth();

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
    const printRef = useRef();

    // ===== محاسبه مجموع =====
    useEffect(() => {
      const sum = prescriptionItems.reduce((t, i) => t + Number(i.total_price), 0);
      setTotalAmount(sum);
    }, [prescriptionItems]);

    useEffect(() => {
      setNetAmount(totalAmount - discount);
    }, [totalAmount, discount]);

    // ===== بارگذاری داده‌ها =====
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

    // ===== اطلاعات مریض انتخاب شده =====
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

    // ===== فیلتر دواها و حمایت‌کننده‌ها =====
    const filteredMedications = medications.filter(
      m => Number(m.category_id) === Number(formItem.category_id)
    );
    const selectedMedication = medications.find(m => Number(m.med_id) === Number(formItem.med_id));
    const filteredSuppliers = selectedMedication
      ? suppliers.filter(s => s.reg_id == selectedMedication.supplier_id)
      : [];

    // ... همه ایمپورت‌ها و state‌ها همانند قبل

  // ===== تغییرات فرم آیتم =====
  const handleChange = (field, value) => {
    let updated = { ...formItem, [field]: value };

    if (field === "category_id") {
      updated.med_id = "";
      updated.supplier_id = "";
      updated.unit_price = 0;
      updated.type = "";
    }

    if (field === "med_id") {
      const med = medications.find(m => m.med_id == value);
      updated.type = med?.type ?? "";
      updated.unit_price = med?.unit_price ?? 0;
      updated.supplier_id = "";
    }

    const quantity = Number(updated.quantity) || 0;
    const unit_price = Number(updated.unit_price) || 0;
    updated.total_price = quantity * unit_price;

    setFormItem(updated);
  };

  // ===== افزودن آیتم با Enter =====
  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!formItem.category_id || !formItem.med_id || !formItem.supplier_id || Number(formItem.quantity) <= 0) {
        toast.error("❌ معلومات آیتم کامل نیست");
        return;
      }
      setPrescriptionItems(prev => [...prev, { ...formItem }]);
      setFormItem({ ...emptyItem });
    }
  };


    const handleRemoveItem = index => {
      setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
      setSelectedPatientId("");
      setSelectedDoctorId("");
      setPrescriptionDate("");
      setDiscount(0);
      setTotalAmount(0);
      setNetAmount(0);
      setPrescriptionItems([]);
      setFormItem({ ...emptyItem });
      setPatientInfo({
        age: "",
        phone: "",
        blood_group: "",
        reg_id: "",
        pres_num: ""
      });
    };

    // ===== تبدیل فونت =====
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

      const response = await fetch("/fonts/Vazirmatn-Regular.ttf");
      const fontBuffer = await response.arrayBuffer();
      const fontBase64 = arrayBufferToBase64(fontBuffer);

      doc.addFileToVFS("Vazir-Regular.ttf", fontBase64);
      doc.addFont("Vazir-Regular.ttf", "Vazir", "normal");
      doc.setFont("Vazir");

      doc.text(`نسخه شماره: ${patientInfo.pres_num}`, 420, 40, { align: "right" });
      doc.text(`تاریخ: ${prescriptionDate || new Date().toLocaleDateString("fa-IR")}`, 420, 60, { align: "right" });
      doc.text(`مریض: ${patients.find(p => p.reg_id == selectedPatientId)?.full_name || "-"}`, 420, 80, { align: "right" });
      doc.text(`سن: ${patientInfo.age}`, 420, 100, { align: "right" });
      doc.text(`شماره تماس: ${patientInfo.phone}`, 420, 120, { align: "right" });
      doc.text(`داکتر: ${doctors.find(d => d.reg_id == selectedDoctorId)?.full_name || "-"}`, 420, 140, { align: "right" });

      const tableColumn = [
        "ردیف","کتگوری","دوا","حمایت‌کننده","نوع دوا","مقدار مصرف","تعداد","قیمت واحد","قیمت مجموعی","ملاحظات"
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

      autoTable(doc, {
        startY: 160,
        head: [tableColumn],
        body: tableRows,
        styles: { font: "Vazir", fontSize: 10, halign: "right" },
        headStyles: { fillColor: [8, 14, 46], textColor: 255 },
        margin: { right: 20 },
        rtl: true,
      });

      doc.text(`مجموع: ${totalAmount}`, 420, doc.lastAutoTable.finalY + 20, { align: "right" });
      doc.text(`تخفیف: ${discount}`, 420, doc.lastAutoTable.finalY + 40, { align: "right" });
      doc.text(`خالص: ${netAmount}`, 420, doc.lastAutoTable.finalY + 60, { align: "right" });

      doc.save(`نسخه_${patientInfo.pres_num}.pdf`);
    };

    // ===== ذخیره نسخه =====
    const handleSavePrescription = async () => {
      if (!selectedPatientId || !selectedDoctorId || prescriptionItems.length === 0) {
        toast.error("❌ معلومات نسخه ناقص است");
        return;
      }

      try {
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
    <MainLayoutjur>
      <ToastContainer />

      <div className="main-layout">
        <div className="background-overlay"></div>

        <div className="layout-content">

          {/* ===== معلومات نسخه ===== */}
          <div className="form-container">
            <h1>ثبت نسخه جدید</h1>

            <div className="form-grid">
              <div>
                <label>شماره نسخه</label>
                <input
                  value={patientInfo.pres_num}
                  onChange={e =>
                    setPatientInfo({ ...patientInfo, pres_num: e.target.value })
                  }
                />
              </div>

              <div>
                <label>مریض</label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                >
                  <option value="">انتخاب مریض</option>
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
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                >
                  <option value="">انتخاب داکتر</option>
                  {doctors.map(d => (
                    <option key={d.reg_id} value={d.reg_id}>
                      {d.full_name ?? d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>تاریخ نسخه</label>
                <input
                  type="date"
                  value={prescriptionDate}
                  onChange={e => setPrescriptionDate(e.target.value)}
                />
              </div>

              <div>
                <label>مجموع</label>
                <input value={totalAmount} readOnly />
              </div>

              <div>
                <label>تخفیف</label>
                <input
                  value={discount}
                  onChange={e => setDiscount(+e.target.value)}
                />
              </div>

              <div>
                <label>خالص</label>
                <input value={netAmount} readOnly />
              </div>
            </div>
          </div>

          {/* ===== فرم آیتم ===== */}
          <div className="form-container">
            <h3>افزودن آیتم</h3>

            <div className="form-grid">
              <div>
                <label>کتگوری</label>
                <select
                  value={formItem.category_id}
                  onChange={e => handleChange("category_id", e.target.value)}
                  onKeyDown={handleKeyDown}
                >
                  <option value="">انتخاب</option>
                  {categories.map(c => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>دوا</label>
                <select
                  value={formItem.med_id}
                  onChange={e => handleChange("med_id", e.target.value)}
                  onKeyDown={handleKeyDown}
                >
                  <option value="">انتخاب</option>
                  {filteredMedications.map(m => (
                    <option key={m.med_id} value={m.med_id}>
                      {m.gen_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>حمایت‌کننده</label>
                <select
                  value={formItem.supplier_id}
                  onChange={e => handleChange("supplier_id", e.target.value)}
                  onKeyDown={handleKeyDown}
                >
                  <option value="">انتخاب</option>
                  {filteredSuppliers.map(s => (
                    <option key={s.reg_id} value={s.reg_id}>
                      {s.full_name ?? s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>نوع دوا</label>
                <input value={formItem.type} readOnly />
              </div>

              <div>
                <label>مقدار مصرف</label>
                <input
                  value={formItem.dosage}
                  onChange={e => handleChange("dosage", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div>
                <label>تعداد</label>
                <input
                  type="number"
                  value={formItem.quantity}
                  onChange={e => handleChange("quantity", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div>
                <label>قیمت واحد</label>
                <input
                  type="number"
                  value={formItem.unit_price}
                  onChange={e => handleChange("unit_price", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div>
                <label>قیمت مجموعی</label>
                <input value={formItem.total_price} readOnly />
              </div>

              <div>
                <label>ملاحظات</label>
                <input
                  value={formItem.remarks}
                  onChange={e => handleChange("remarks", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </div>

          {/* ===== جدول آیتم‌ها ===== */}
          {prescriptionItems.length > 0 && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ردیف</th>
                    <th>کتگوری</th>
                    <th>دوا</th>
                    <th>حمایت‌کننده</th>
                    <th>نوع دوا</th>
                    <th>مقدار مصرف</th>
                    <th>تعداد</th>
                    <th>قیمت واحد</th>
                    <th>قیمت مجموعی</th>
                    <th>ملاحظات</th>
                    <th>عملیات</th>
                  </tr>
                </thead>

                <tbody>
                  {prescriptionItems.map((item, idx) => {
                    const med = medications.find(m => m.med_id == item.med_id);
                    const cat = categories.find(c => c.category_id == item.category_id);
                    const sup = suppliers.find(s => s.reg_id == item.supplier_id);

                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{cat?.category_name}</td>
                        <td>{med?.gen_name}</td>
                        <td>{sup?.full_name ?? sup?.name}</td>
                        <td>{item.type}</td>
                        <td>{item.dosage}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit_price}</td>
                        <td>{item.total_price}</td>
                        <td>{item.remarks}</td>
                        <td>
                          <button
                            className="delete"
                            onClick={() => handleRemoveItem(idx)}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <button className="edit" onClick={handleSavePrescription}>
            ثبت نسخه
          </button>
            <ReactToPrint
    trigger={() => <button className="edit">پرنت نسخه</button>}
    content={() => printRef.current}
  />
        </div>
      </div>
  <div style={{ display: "none" }}>
    <PrescriptionPrint
      ref={printRef}
      data={{
        pres_num: patientInfo.pres_num,
        date: prescriptionDate,
        patient: patients.find(p => p.reg_id == selectedPatientId)?.full_name,
        doctor: doctors.find(d => d.reg_id == selectedDoctorId)?.full_name,
        items: prescriptionItems,
        total: totalAmount,
        discount: discount,
        net: netAmount
      }}
    />
  </div>


    </MainLayoutjur>
  );

  }

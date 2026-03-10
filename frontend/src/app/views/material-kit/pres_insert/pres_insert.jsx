  import { useState, useEffect, useRef } from "react";
import MainLayoutjur from "../../../../components/MainLayoutjur";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";
import { useReactToPrint } from "react-to-print";
import PrescriptionPrint from "../PrescriptionPrint";

export default function PrescriptionForm() {
  const { api } = useAuth();
  const printRef = useRef(null);

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
    gender: "",
    phone: "",
    blood_group: "",
    reg_id: "",
    pres_num: "",
    tazkira_number: ""
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
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [formItem, setFormItem] = useState(emptyItem);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrescriptions = prescriptionsList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(prescriptionsList.length / itemsPerPage);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: patientInfo?.pres_num || "Prescription",
  });

  useEffect(() => {
    document.title = ".";
    api.get("/registrations").then(res => {
      const data = res.data.data ?? res.data ?? [];
      setPatients(data.filter(r => r.reg_type === "patient"));
      setDoctors(data.filter(r => r.reg_type === "doctor"));
      setSuppliers(data.filter(r => r.reg_type === "supplier"));
    });
    api.get("/categories").then(res => setCategories(res.data.data ?? res.data));
    api.get("/medications").then(res => setMedications(res.data.data ?? res.data));
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions");
      const list = res.data?.data ?? res.data ?? [];
      setPrescriptionsList(list);
    } catch (error) {
      console.error("Load prescriptions error:", error);
      toast.error("خطا در دریافت نسخه ها");
    }
  };

  useEffect(() => {
    const sum = prescriptionItems.reduce((t, i) => t + Number(i.total_price || 0), 0);
    setTotalAmount(sum);
  }, [prescriptionItems]);

  useEffect(() => {
    setNetAmount(totalAmount - discount);
  }, [totalAmount, discount]);

  useEffect(() => {
    if (!selectedPatientId) return;
    const p = patients.find(x => x.reg_id == selectedPatientId);
    if (!p) return;
    setPatientInfo({
      age: p.age ?? "",
      gender: p.gender ?? "",
      phone: p.phone ?? "",
      blood_group: p.blood_group ?? "",
      reg_id: p.reg_id ?? "",
      pres_num: p.pres_num ?? "",
      tazkira_number: p.tazkira_number ?? ""
    });
  }, [selectedPatientId, patients]);

  const filteredMedications = editingId && prescriptionItems.length > 0
    ? medications.filter(m => prescriptionItems.some(item => item.med_id == m.med_id))
    : medications.filter(m => Number(m.category_id) === Number(formItem.category_id));

  const selectedMedication = medications.find(m => Number(m.med_id) === Number(formItem.med_id));

  const filteredSuppliers = editingId && prescriptionItems.length > 0
    ? suppliers.filter(s => prescriptionItems.some(item => item.supplier_id == s.reg_id))
    : selectedMedication
      ? suppliers.filter(s => s.reg_id == selectedMedication.supplier_id)
      : [];

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

  const handleKeyDown = e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!formItem.category_id || !formItem.med_id || !formItem.supplier_id || Number(formItem.quantity) <= 0) {
      toast.error("❌ اطلاعات آیتم کامل نیست");
      return;
    }

    const newItem = { ...formItem, id: Date.now() };

    setPrescriptionItems(prev => [...prev, newItem]);
    setFormItem({ ...emptyItem });
  };

  const handleRemoveItem = id => {
    setPrescriptionItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSavePrescription = async () => {
    if (!selectedPatientId || !selectedDoctorId || prescriptionItems.length === 0) {
      toast.error("❌ اطلاعات نسخه ناقص است");
      return;
    }

    const payload = {
      patient_id: selectedPatientId,
      pres_num: patientInfo.pres_num,
      patient_age: patientInfo.age,
      patient_gender: patientInfo.gender,
      patient_phone: patientInfo.phone,
      patient_reg_id: patientInfo.reg_id,
      patient_blood_group: patientInfo.blood_group,
      tazkira_number: patientInfo.tazkira_number,
      doc_id: selectedDoctorId,
      pres_date: prescriptionDate || new Date().toISOString().slice(0,10),
      total_amount: totalAmount,
      discount,
      net_amount: netAmount,
      items: prescriptionItems.map(item => ({
        category_id: item.category_id,
        med_id: item.med_id,
        supplier_id: item.supplier_id,
        type: item.type,
        dosage: item.dosage,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        remarks: item.remarks
      }))
    };

    try {
      if (editingId) {
        await api.put(`/prescriptions/${editingId}`, payload);
        toast.success("✅ نسخه با موفقیت بروزرسانی شد");
        setEditingId(null);
      } else {
        await api.post("/prescriptions", payload);
        toast.success("✅ نسخه با موفقیت ثبت شد");
      }

      setPrescriptionItems([]);
      setFormItem({ ...emptyItem });
      setSelectedPatientId("");
      setSelectedDoctorId("");
      setPrescriptionDate("");
      setDiscount(0);
      setTotalAmount(0);
      setNetAmount(0);
      setPatientInfo({
        age: "",
        gender: "",
        phone: "",
        blood_group: "",
        reg_id: "",
        pres_num: "",
        tazkira_number: ""
      });

      loadPrescriptions();
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("❌ خطا در ذخیره نسخه");
    }
  };

  const handleEditPrescription = (pres) => {
    setEditingId(pres.pres_id);
    setSelectedPatientId(pres.patient_id);
    setSelectedDoctorId(pres.doc_id);
    setPrescriptionDate(pres.pres_date);
    setDiscount(pres.discount);
    setTotalAmount(pres.total_amount);
    setNetAmount(pres.net_amount);

    const items = (pres.items ?? []).map(i => ({
      id: i.pres_it_id,
      category_id: i.category_id,
      med_id: i.med_id,
      supplier_id: i.supplier_id,
      type: i.type,
      dosage: i.dosage,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.total_price,
      remarks: i.remarks
    }));
    setPrescriptionItems(items);

    if (items.length > 0) {
      const firstItem = items[0];
      setFormItem({
        category_id: firstItem.category_id,
        med_id: firstItem.med_id,
        supplier_id: firstItem.supplier_id,
        type: firstItem.type,
        dosage: firstItem.dosage,
        quantity: firstItem.quantity,
        unit_price: firstItem.unit_price,
        total_price: firstItem.total_price,
        remarks: firstItem.remarks
      });
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!confirm("آیا می‌خواهید این نسخه حذف شود؟")) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      toast.success("نسخه حذف شد");
      loadPrescriptions();
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("خطا در حذف نسخه");
    }
  };

  const printData = {
    pres_num: patientInfo.pres_num,
    date: prescriptionDate || new Date().toLocaleDateString(),
    patient: patients.find(p => p.reg_id == selectedPatientId)?.full_name ?? "-",
    doctor: doctors.find(d => d.reg_id == selectedDoctorId)?.full_name ?? "-",
    age: patientInfo.age,
    gender: patientInfo.gender,
    blood_group: patientInfo.blood_group,
    tazkira_number: patientInfo.tazkira_number,
    total: totalAmount,
    discount,
    net: netAmount,
    items: prescriptionItems.map(item => ({
      ...item,
      category_name: categories.find(c => c.category_id == item.category_id)?.category_name ?? "-",
      med_name: medications.find(m => m.med_id == item.med_id)?.gen_name ?? "-",
      supplier_name: suppliers.find(s => s.reg_id == item.supplier_id)?.full_name ?? "-"
    }))
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
              <label>جنسیت</label>
              <input value={patientInfo.gender} readOnly />
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
              <label>شماره تذکره</label>
              <input value={patientInfo.tazkira_number} readOnly />
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
          <div className="table-container" style={{ marginTop: "10px" }}>
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

  const key = `${item.category_id}-${item.med_id}-${item.supplier_id}-${idx}`;
  return (
    <tr key={key}>
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
          onClick={() => handleRemoveItem(item.id)}
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

        <div style={{ marginTop: "10px" }}>
         <button className="edit" onClick={handleSavePrescription}>
  {editingId ? "ثبت تصحیح نسخه" : "ثبت نسخه"}
</button>
          <button className="edit" onClick={() => {
            if (!prescriptionItems.length) {
              toast.error("آیتمی برای چاپ وجود ندارد");
              return;
            }
            handlePrint();
          }}>پرنت نسخه</button>
        </div>

        <div style={{ display: "none" }}>
          <PrescriptionPrint ref={printRef} data={printData} />
        </div>

        {/* ===== لیست نسخه ها ===== */}
        {prescriptionsList && (
          <div className="table-container" style={{ marginTop: "20px" }}>
            <h3>نسخه های ثبت شده</h3>

            <table>
              <thead>
                <tr>
                  <th>شماره</th>
                  <th>شماره نسخه</th>
                  <th>مریض</th>
                  <th>داکتر</th>
                  <th>تاریخ</th>
                  <th>مجموع</th>
                  <th>تخفیف</th>
                  <th>خالص</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {currentPrescriptions.map((p, index) => {
                  const patient = patients.find(x => x.reg_id == p.patient_id);
                  const doctor = doctors.find(x => x.reg_id == p.doc_id);

                  const key = `${p.pres_id}-${index}`;
                  return (
                    <tr key={key}>
                      <td>{indexOfFirstItem + index + 1}</td> 
                      <td>{p.pres_num}</td>
                      <td>{patient?.full_name}</td>
                      <td>{doctor?.full_name}</td>
                      <td>{p.pres_date}</td>
                      <td>{p.total_amount}</td>
                      <td>{p.discount}</td>
                      <td>{p.net_amount}</td>

                      <td>
                 <td>
  <button
    className="edit"
    onClick={() => handleEditPrescription(p)}
  >
    تصحیح
  </button>

  <button
    className="delete"
    onClick={() => handleDeletePrescription(p.pres_id)}
  >
    حذف
  </button>
</td>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ===== Pagination ===== */}
            {totalPages > 1 && (
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    style={{
                      margin: "0 5px",
                      padding: "5px 10px",
                      backgroundColor: currentPage === num ? "#007bff" : "#f0f0f0",
                      color: currentPage === num ? "#fff" : "#000",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  </MainLayoutjur>
);

  }        
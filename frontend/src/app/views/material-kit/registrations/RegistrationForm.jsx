import { useState } from "react";
import MainLayoutpur from "../../../../components/MainLayoutpur";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";

export default function RegistrationForm() {
  const { api } = useAuth();

  const [form, setForm] = useState({
    reg_type: "",
    full_name: "",
    father_name: "",
    phone: "",
    gender: "",
    age: "",
    blood_group: "",
    address: "",
    visit_date: "",
    note: "",
    status: 1,
  });

  // ================= تغییر مقدار =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= ثبت اطلاعات =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.reg_type || !form.full_name) {
      toast.error("❌ نوع راجستریشن و نام الزامی است");
      return;
    }

    try {
      await api.post("/registrations", form);
      toast.success("✅ ثبت موفقانه انجام شد");

      setForm({
        reg_type: "",
        full_name: "",
        father_name: "",
        phone: "",
        gender: "",
        age: "",
        blood_group: "",
        address: "",
        visit_date: "",
        note: "",
        status: 1,
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ خطا در ثبت معلومات");
    }
  };

  return (
    <MainLayoutpur>
      <ToastContainer />
 <div className="form-container">
  <h2 style={{ textAlign: "center" }}>📋 راجستریشن عمومی شفاخانه</h2>

  <form onSubmit={handleSubmit} className="form-grid">
    {/* نوع */}
    <div>
      <label>نوع راجستریشن *</label>
      <select
        name="reg_type"
        value={form.reg_type}
        onChange={handleChange}
        className="form-control"
      >
        <option value="">-- انتخاب --</option>

        <optgroup label="اشخاص">
          <option value="patient">مریض</option>
          <option value="doctor">داکتر</option>
          <option value="visitor">مراجع</option>
          <option value="customer">مشتری</option>
          <option value="staff">کارمند</option>
          <option value="supplier">تأمین‌کننده</option>
        </optgroup>

        <optgroup label="مصارف">
          <option value="rent">کرایه</option>
          <option value="electricity">برق</option>
          <option value="water">آب</option>
          <option value="internet">انترنت</option>
          <option value="salary">معاش</option>
          <option value="fuel">سوخت</option>
          <option value="maintenance">ترمیمات</option>
        </optgroup>

        <optgroup label="خدمات">
          <option value="laboratory">لابراتوار</option>
          <option value="transport">ترانسپورت</option>
          <option value="consultation">مشاوره</option>
        </optgroup>

        <optgroup label="دیگر">
          <option value="expense">مصرف عمومی</option>
          <option value="income">درآمد</option>
          <option value="other">سایر</option>
        </optgroup>
      </select>
    </div>

    {/* نام */}
    <div>
      <label>نام کامل / عنوان *</label>
      <input
        type="text"
        name="full_name"
        value={form.full_name}
        onChange={handleChange}
        className="form-control"
      />
    </div>

    {/* نام پدر */}
    <div>
      <label>نام پدر</label>
      <input
        type="text"
        name="father_name"
        value={form.father_name}
        onChange={handleChange}
        className="form-control"
      />
    </div>

    {/* تلفن */}
    <div>
      <label>شماره تماس</label>
      <input
        type="text"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        className="form-control"
      />
    </div>

    {/* جنسیت */}
    <div>
      <label>جنسیت</label>
      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        className="form-control"
      >
        <option value="">-- انتخاب --</option>
        <option value="male">مرد</option>
        <option value="female">زن</option>
        <option value="other">دیگر</option>
      </select>
    </div>

    {/* سن */}
    <div>
      <label>سن</label>
      <input
        type="number"
        name="age"
        value={form.age}
        onChange={handleChange}
        className="form-control"
      />
    </div>

    {/* گروه خون */}
    <div>
      <label>گروه خون</label>
      <input
        type="text"
        name="blood_group"
        value={form.blood_group}
        onChange={handleChange}
        className="form-control"
      />
    </div>

    {/* تاریخ */}
    <div>
      <label>تاریخ مراجعه / مصرف</label>
      <input
        type="date"
        name="visit_date"
        value={form.visit_date}
        onChange={handleChange}
        className="form-control"
      />
    </div>

    {/* آدرس */}
    <div className="full-width">
      <label>آدرس</label>
      <textarea
        name="address"
        value={form.address}
        onChange={handleChange}
        className="form-control"
        rows="3"
      />
    </div>

    {/* یادداشت */}
    <div className="full-width">
      <label>یادداشت</label>
      <textarea
        name="note"
        value={form.note}
        onChange={handleChange}
        className="form-control"
        rows="3"
      />
    </div>

    {/* دکمه */}
    <div className="full-width center">
      <button type="submit" className="edit">ثبت راجستریشن</button>
    </div>
  </form>
</div>

    </MainLayoutpur>
  );
}

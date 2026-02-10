import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../../api";
import MainLayoutpur from "../../../../components/MainLayoutpur";

const MedicationForm = () => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    category_id: "",
    supplier_id: "",
    type: "",
    gen_name: "",
    dosage: "",
  });

  // ================= load data =================
  useEffect(() => {
    // categories
    api.get("/categories")
      .then(res => {
        const data = res.data.data ?? res.data ?? [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("❌ خطا در دریافت کتگوری‌ها"));

    // suppliers
    api.get("/registrations")
      .then(res => {
        const data = res.data.data ?? res.data ?? [];
        const onlySuppliers = Array.isArray(data)
          ? data.filter(r => r.reg_type === "supplier")
          : [];
        setSuppliers(onlySuppliers);
      })
      .catch(() => toast.error("❌ خطا در دریافت حمایت‌کننده‌ها"));
  }, []);

  // ================= handle change =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ================= submit =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/medications", {
        ...formData,
        supplier_id: Number(formData.supplier_id),
        category_id: Number(formData.category_id),
      });

      toast.success("✅ معلومات دوا با موفقیت ثبت شد");

      setFormData({
        category_id: "",
        supplier_id: "",
        type: "",
        gen_name: "",
        dosage: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("❌ خطا در ثبت دوا");
    }
  };

  return (
    <MainLayoutpur>
      <div className="form-container">
        <h2 style={{ textAlign: "center" }}>فرم ثبت دوا</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          {/* category */}
          <div>
            <label>انتخاب کتگوری</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">انتخاب کتگوری</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* supplier */}
          <div>
            <label>انتخاب حمایت‌کننده</label>
            <select
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              required
            >
              <option value="">انتخاب حمایت‌کننده</option>
              {suppliers.map(s => (
                <option key={s.reg_id} value={s.reg_id}>
                  {s.full_name || s.name}
                </option>
              ))}
            </select>
          </div>

          {/* type */}
          <div>
            <label>نوعیت</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            />
          </div>

          {/* general name */}
          <div>
            <label>نام عمومی دوا</label>
            <input
              type="text"
              name="gen_name"
              value={formData.gen_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* dosage */}
          <div>
            <label>مقدار مصرف</label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              required
            />
          </div>

          {/* submit button */}
          <div style={{ gridColumn: "1 / span 2", textAlign: "center" }}>
            <button type="submit" className="edit">ثبت دوا</button>
          </div>
        </form>
      </div>
    </MainLayoutpur>
  );
};

export default MedicationForm;

 
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../../api";
import MainLayoutpm from "../../../../components/MainLayoutpm";

const MedicationForm = () => {
    <img src="/khan.jpg" alt="test" />  
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
   
    supplier_id: "",
    type:"",
    supplier_name: "",
    gen_name: "",
    dosage: "",
    
    
     
    
  });

  // بارگذاری کتگوری‌ها و تأمین‌کننده‌ها هنگام لود فرم
  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (Array.isArray(res.data.data)) data = res.data.data;
        else if (Array.isArray(res.data.categories)) data = res.data.categories;
        setCategories(data);
      })
      .catch((err) => console.error("خطا در دریافت کتگوری‌ها:", err));

    api.get("/suppliers")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.suppliers || [];
        setSuppliers(data);
      })
      .catch((err) => console.error("خطا در دریافت تأمین‌کننده‌ها:", err));
  }, []);

  // تغییر مقدار فرم
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "supplier_id") {
      const selectedSupplier = suppliers.find(
        (sup) => parseInt(sup.supplier_id) === parseInt(value)
      );
      setFormData({
        ...formData,
        supplier_id: value,
        supplier_name: selectedSupplier ? selectedSupplier.name : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ثبت فرم
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/medications", formData);

      toast.success("✅ معلومات دوا با موفقیت ثبت شد!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });

      // ریست فرم
      setFormData({
        category_id: "",
        category_name:"",
        supplier_id: "",
        supplier_name: "",
        gen_name: "",
        dosage: "",
        type:"",
       
      });
    } catch (error) {
      console.error("خطا در ثبت دارو:", error);
      toast.error("❌ خطا در ثبت دارو. لطفاً دوباره تلاش کنید.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  return (
    <MainLayoutpm >
    <div className="medication-page">
      <div className="form-wrapper">
        <div className="form-container">
          <h2 align="center">فرم ثبت دارو</h2>
          <form onSubmit={handleSubmit}>
        {/* انتخاب کتگوری */}
<label>انتخاب کتگوری:</label>
<select
  name="category_id"
  value={formData.category_id}
  onChange={handleChange}
  required
>
  <option value="">انتخاب کتگوری</option>
  {categories.length > 0 ? (
    categories.map((cat) => (
      <option key={cat.category_id} value={cat.category_id}>
        {cat.category_name}
      </option>
    ))
  ) : (
    <option disabled>هیچ کتگوری موجود نیست</option>
  )}
</select>

{/* انتخاب تأمین‌کننده */}
<label>انتخاب تأمین‌کننده:</label>
<select
  name="supplier_id"
  value={formData.supplier_id}
  onChange={handleChange}
  required
>
  <option value="">انتخاب تأمین‌کننده</option>
  {suppliers.length > 0 ? (
    suppliers.map((supplier) => (
      <option key={supplier.supplier_id} value={supplier.supplier_id}>
        {supplier.name}
      </option>
    ))
  ) : (
    <option disabled>هیچ تأمین‌کننده‌ای موجود نیست</option>
  )}
</select>


            {/* اطلاعات دیگر */}
            <label>نوعیت </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            />
            {/* اطلاعات دیگر */}
            <label>نام عمومی دوا:</label>
            <input
              type="text"
              name="gen_name"
              value={formData.gen_name}
              onChange={handleChange}
              required
            />

            <label>مقدار مصرف:</label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              required
            />

           

            <button type="submit">ثبت</button>
          </form>
        </div>
      </div>
    </div>
    </MainLayoutpm>
  );
};

export default MedicationForm;

import { useState, useEffect, useRef } from "react";
import MainLayoutjur from "../../../../components/MainLayoutjur";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";
import { useReactToPrint } from "react-to-print";
import PurchasePrint from "./PurchasePrint"; // حتما با forwardRef ساخته شده باشد

export default function ParchaseForm() {
  const { api } = useAuth();
  const printRef = useRef(null);

  // نسخه پرینت مشابه فروش
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "purchase-bill",
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  // داده‌های فرم و آیتم‌ها
  const [parchaseDate, setParchaseDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [medications, setMedications] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalPurchase, setTotalPurchase] = useState(0);
  const [par_paid, setParPaid] = useState(0);
  const [due_par, setDuePar] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [formItem, setFormItem] = useState({
    category_id: "",
    med_id: "",
    type: "",
    quantity: "",
    unit_price: "",
    total_price: 0,
    exp_date: "",
  });
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [purchaseData, setPurchaseData] = useState(null); // داده برای پرینت

  // ===== محاسبه مجموع خرید =====
  useEffect(() => {
    const sum = purchasedItems.reduce((t, i) => t + Number(i.total_price || 0), 0);
    setTotalPurchase(sum);
  }, [purchasedItems]);

  useEffect(() => {
    const due = Number(totalPurchase) - Number(par_paid || 0);
    setDuePar(due >= 0 ? due : 0);
  }, [totalPurchase, par_paid]);

  // ===== لود داده‌ها =====
  useEffect(() => {
    api.get("/categories").then(res => setCategories(res.data.data ?? res.data));
    api.get("/medications").then(res => setMedications(res.data.data ?? res.data));
    api.get("/registrations").then(res => {
      const data = res.data.data ?? res.data ?? [];
      setSuppliers(data.filter(r => r.reg_type === "supplier"));
    });
  }, [api]);

  // فیلتر دواها
  const filteredMedications = medications.filter(
    m => Number(m.category_id) === Number(formItem.category_id)
  );

  const handleChange = (field, value) => {
    let updated = { ...formItem, [field]: value };

    if (field === "category_id") {
      updated.med_id = "";
      updated.type = "";
    }

    if (field === "med_id") {
      const med = medications.find(m => Number(m.med_id) === Number(value));
      updated.type = med?.type ?? "";
      updated.unit_price = med?.unit_price ?? "";
    }

    const qty = Number(field === "quantity" ? value : updated.quantity || 0);
    const price = Number(field === "unit_price" ? value : updated.unit_price || 0);
    updated.total_price = qty * price;

    setFormItem(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (
      !formItem.category_id ||
      !formItem.med_id ||
      !formItem.quantity ||
      !formItem.unit_price ||
      !formItem.exp_date
    ) {
      toast.error("❌ لطفاً تمام فیلدها را پر کنید");
      return;
    }

    const med = medications.find(m => Number(m.med_id) === Number(formItem.med_id));
    const cat = categories.find(c => Number(c.category_id) === Number(formItem.category_id));

    setPurchasedItems(prev => [
      ...prev,
      {
        ...formItem,
        med_name: med?.gen_name ?? "-",
        category_name: cat?.category_name ?? "-",
        id: Date.now(),
      }
    ]);

    setFormItem({
      category_id: "",
      med_id: "",
      type: "",
      quantity: "",
      unit_price: "",
      total_price: 0,
      exp_date: ""
    });
  };

  const handleRemoveItem = (id) => {
    setPurchasedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSavePurchase = async () => {
    if (!selectedSupplier) {
      toast.error("❌ لطفاً حمایت‌کننده را انتخاب کنید");
      return;
    }

    if (purchasedItems.length === 0) {
      toast.error("❌ حداقل یک آیتم اضافه کنید");
      return;
    }

    const payload = {
      parchase_date: parchaseDate || new Date().toISOString().split("T")[0],
      par_paid,
      supplier_id: selectedSupplier,
      items: purchasedItems.map(item => ({
        med_id: item.med_id,
        category_id: item.category_id,
        type: item.type,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        exp_date: item.exp_date,
      })),
    };

    try {
      const res = await api.post("/parchases", payload);
      const purchaseId = res?.data?.parchase_id ?? "-";
      const supplier = suppliers.find(s => Number(s.reg_id) === Number(selectedSupplier));

      // آماده سازی دیتا برای پرینت (همانند فروش)
      const dataForPrint = {
        purchase_number: purchaseId,
        date: parchaseDate || new Date().toLocaleDateString(),
        supplier: supplier?.full_name ?? supplier?.name ?? "-",
        items: purchasedItems,
        totalPurchase,
        paid: par_paid,
        due: due_par
      };

      setPurchaseData(dataForPrint);
      toast.success("✅ خرید با موفقیت ثبت شد");

      // پرینت
      setTimeout(() => {
        if (printRef.current) handlePrint();
      }, 300);

      // ریست فرم
      setPurchasedItems([]);
      setParPaid(0);
      setDuePar(0);
      setTotalPurchase(0);
      setParchaseDate("");
      setSelectedSupplier("");

    } catch (err) {
      console.error(err);
      toast.error("❌ خطا در ثبت خرید");
    }
  };

  return (
     <MainLayoutjur>
       <ToastContainer />
       <div className="main-layout">
         <div className="background-overlay"></div>
         <div className="layout-content">
 
           {/* اطلاعات خرید */}
           <div className="form-container">
             <h2 style={{ textAlign: "center", marginBottom: "20px" }}>ثبت خرید دوا</h2>
             <div className="form-grid">
               <div>
                 <label>تاریخ خرید</label>
                 <input type="date" value={parchaseDate} onChange={e => setParchaseDate(e.target.value)} />
               </div>
               <div>
                 <label>مجموع خرید</label>
                 <input type="number" value={totalPurchase} readOnly />
               </div>
               <div>
                 <label>مبلغ پرداخت شده</label>
                 <input type="number" value={par_paid} onChange={e => setParPaid(Number(e.target.value))} />
               </div>
               <div>
                 <label>مبلغ باقی‌مانده</label>
                 <input type="number" value={due_par} readOnly />
               </div>
               <div>
                 <label>حمایت‌کننده</label>
                 <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                   <option value="">-- انتخاب --</option>
                   {suppliers.map(s => (
                     <option key={s.reg_id} value={s.reg_id}>{s.full_name ?? s.name}</option>
                   ))}
                 </select>
               </div>
             </div>
           </div>
 
           {/* فرم آیتم‌ها */}
           <div className="form-container">
             <h3>افزودن آیتم</h3>
             <div className="form-grid" onKeyDown={handleKeyDown}>
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
                   <option value="">-- انتخاب حمایت‌کننده --</option>
                   {suppliers.map((s) => (
                     <option key={s.reg_id} value={s.reg_id}>
                       {s.full_name ?? s.name}
                     </option>
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
             </div>
           </div>
 
           {/* جدول آیتم‌ها */}
           {purchasedItems.length > 0 && (
             <div className="table-container">
               <table className="dark-table">
                 <thead>
                   <tr>
                     <th>شماره</th>
                     <th>کتگوری</th>
                     <th>دوا</th>
                     <th>نوع دوا</th>
                     <th>تعداد</th>
                     <th>قیمت واحد</th>
                     <th>قیمت مجموعی</th>
                     <th>تاریخ انقضا</th>
                     <th>عملیات</th>
                   </tr>
                 </thead>
                 <tbody>
                   {purchasedItems.map((item, idx) => (
                     <tr key={item.id}>
                       <td>{idx + 1}</td>
                       <td>{item.category_name}</td>
                       <td>{item.med_name}</td>
                       <td>{item.type}</td>
                       <td>{item.quantity}</td>
                       <td>{item.unit_price?.toLocaleString()}</td>
                       <td>{item.total_price?.toLocaleString()}</td>
                       <td>{item.exp_date}</td>
                       <td>
                         <button className="delete" onClick={() => handleRemoveItem(item.id)}>حذف</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
 
          <button className="edit" onClick={handleSavePurchase}>
            ثبت خرید
          </button>

          <button
            className="edit"
            style={{ marginTop: "20px" }}
            onClick={() => {
              if (!purchaseData) {
                toast.info("برای پرینت ابتدا خرید را ثبت کنید.");
                return;
              }
              handlePrint();
            }}
          >
            چاپ خرید
          </button>

          {/* کامپوننت مخفی پرینت */}
          {purchaseData && (
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
              <PurchasePrint ref={printRef} purchaseData={purchaseData} />
            </div>
          )}
        </div>
      </div>
    </MainLayoutjur>
  );
}
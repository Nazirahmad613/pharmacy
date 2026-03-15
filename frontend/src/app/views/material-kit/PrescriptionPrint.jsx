import React, { forwardRef } from "react";
import "./sale-print.css";

const PrescriptionPrint = forwardRef(({ data }, ref) => {
  // ⚡️ جنسیت به فارسی
  const genderFa =
    data?.gender?.toLowerCase() === "male"
      ? "مرد"
      : data?.gender?.toLowerCase() === "female"
      ? "زن"
      : "-";

  return (
    <div ref={ref} className="print-container" style={{ padding: "20px", direction: "rtl" }}>
      {data ? (
        <>
          <div className="bill-header" style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #333", paddingBottom: "10px" }}>
            <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>نسخه طبی</h2>
            <div className="bill-meta" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", textAlign: "right" }}>
              <div><strong>شماره نسخه:</strong> {data.pres_num || "-"}</div>
              <div><strong>مریض:</strong> {data.patient || "-"}</div>
              <div><strong>سن:</strong> {data.age || "-"}</div>
              <div><strong>جنسیت:</strong> {genderFa}</div>
              <div><strong>گروپ خون:</strong> {data.blood_group || "-"}</div>
              <div><strong>داکتر:</strong> {data.doctor || "-"}</div>
              <div><strong>تذکره:</strong> {data.tazkira_number || "-"}</div>
              <div><strong>تاریخ:</strong> {data.date || "-"}</div>
            </div>
          </div>

          <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>ردیف</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>کتگوری</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>نام دوا</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>حمایت‌کننده</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>نوع دوا</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>مقدار مصرف</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>تعداد</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>قیمت واحد</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>قیمت کل</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{i + 1}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{item.category_name || "-"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{item.med_name || "-"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{item.supplier_name || "-"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{item.type || "-"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{item.dosage || "-"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{Number(item.unit_price).toLocaleString()}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{Number(item.total_price).toLocaleString()}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{item.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bill-summary-horizontal" style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
            <div><strong>مجموع:</strong> {Number(data.total).toLocaleString()}</div>
            <div><strong>تخفیف:</strong> {Number(data.discount).toLocaleString()}</div>
            <div><strong>خالص:</strong> {Number(data.net).toLocaleString()}</div>
          </div>

          <div className="bill-footer" style={{ textAlign: "center", marginTop: "30px", padding: "10px", borderTop: "1px solid #333" }}>
            <p>تشکر از مراجعه شما</p>
          </div>
        </>
      ) : (
        <div style={{ padding: "20px", textAlign: "center" }}>در حال آماده‌سازی...</div>
      )}
    </div>
  );
});

export default PrescriptionPrint;
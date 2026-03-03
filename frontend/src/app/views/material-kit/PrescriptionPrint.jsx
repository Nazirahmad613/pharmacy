import React, { forwardRef } from "react";
import "./sale-print.css";

const PrescriptionPrint = forwardRef(({ data }, ref) => {
  if (!data) return null;

  const genderFa =
    data.gender?.toLowerCase() === "male"
      ? "مرد"
      : data.gender?.toLowerCase() === "female"
      ? "زن"
      : "-";

  return (
    <div ref={ref} className="print-container">
      <div className="bill-header">
        <h2>نسخه طبی</h2>

        <div className="bill-meta">
          <span>شماره نسخه: {data.pres_num}</span>
          <span>مریض: {data.patient}</span>
          <span>سن: {data.age}</span>
          <span>جنسیت: {genderFa}</span>
          <span>گروپ خون: {data.blood_group}</span>
          <span>داکتر: {data.doctor}</span>
          <span>تاریخ: {data.date}</span>
        </div>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>شماره</th>
            <th>کتگوری</th>
            <th>نام دوا</th>
            <th>حمایت‌کننده</th>
            <th>نوع دوا</th>
            <th>مقدار مصرف</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>قیمت کل</th>
          </tr>
        </thead>

        <tbody>
          {data.items?.map((item, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{item.category_name}</td>
              <td>{item.med_name}</td>
              <td>{item.supplier_name}</td>
              <td>{item.type}</td>
              <td>{item.dosage}</td>
              <td>{item.quantity}</td>
              <td>{Number(item.unit_price).toLocaleString()}</td>
              <td>{Number(item.total_price).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bill-summary-horizontal">
        <div>
          <span>مجموع</span>
          <strong>{Number(data.totalAmount).toLocaleString()}</strong>
        </div>

        <div>
          <span>تخفیف</span>
          <strong>{Number(data.discount).toLocaleString()}</strong>
        </div>

        <div>
          <span>خالص</span>
          <strong>{Number(data.netAmount).toLocaleString()}</strong>
        </div>
      </div>

      <div className="bill-footer">تشکر از مراجعه شما</div>
    </div>
  );
});

export default PrescriptionPrint;
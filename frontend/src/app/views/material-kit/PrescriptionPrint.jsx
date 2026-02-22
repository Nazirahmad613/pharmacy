import React, { forwardRef } from "react";

const PrescriptionPrint = forwardRef(({ data }, ref) => {
  return (
    <div ref={ref} className="print-container">

      <div className="print-header">
        <h2>کلینیک تخصصی شما</h2>
        <p>شماره تماس: 0700000000</p>
      </div>

      <div className="print-info">
        <div>نسخه شماره: {data.pres_num}</div>
        <div>تاریخ: {data.date}</div>
        <div>مریض: {data.patient}</div>
        <div>داکتر: {data.doctor}</div>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>ردیف</th>
            <th>دوا</th>
            <th>مقدار</th>
            <th>تعداد</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.dosage}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-footer">
        <div>مجموع: {data.total}</div>
        <div>خالص: {data.net}</div>
      </div>

    </div>
  );
});

export default PrescriptionPrint;
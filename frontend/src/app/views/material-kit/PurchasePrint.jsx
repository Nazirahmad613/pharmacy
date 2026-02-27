import React, { forwardRef } from "react";
import "./sale-print.css";

const PurchasePrint = forwardRef(({ purchaseData }, ref) => {
  if (!purchaseData) return null;

  return (
    <div ref={ref} className="print-container">

      {/* هدر بل */}
      <div className="bill-header">
        <h2>بل خرید</h2>
        <div className="bill-meta">
          <span>شماره خرید: {purchaseData.purchase_number}</span>
          <span>حمایت‌کننده: {purchaseData.supplier}</span>
          <span>تاریخ: {purchaseData.date}</span>
        </div>
      </div>

      {/* جدول آیتم‌ها */}
      <table className="print-table">
        <thead>
          <tr>
            <th>شماره</th>
            <th>نام دوا</th>
            <th>نوع</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>قیمت مجموعی</th>
          </tr>
        </thead>
        <tbody>
          {purchaseData.items?.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.med_name}</td>
              <td>{item.type}</td>
              <td>{item.quantity}</td>
              <td>{Number(item.unit_price).toLocaleString()}</td>
              <td>{Number(item.total_price).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* خلاصه حساب افقی مثل فروش */}
      <div className="bill-summary-horizontal">

        <div>
          <span>مجموع خرید</span>
          <strong>{purchaseData.totalPurchase?.toLocaleString()}</strong>
        </div>

        <div>
          <span>پرداخت شده</span>
          <strong>{purchaseData.paid?.toLocaleString()}</strong>
        </div>

        <div>
          <span>باقی‌مانده</span>
          <strong>{purchaseData.due?.toLocaleString()}</strong>
        </div>

      </div>

      <div className="bill-footer">
        تشکر از همکاری شما
      </div>

    </div>
  );
});

export default PurchasePrint;
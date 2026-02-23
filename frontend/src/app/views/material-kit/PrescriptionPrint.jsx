import React, { forwardRef } from "react";
import "./print.css";

const PrescriptionPrint = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref} className="print-container">

      {/* ====== Header ====== */}
      <div className="print-header">
        <h1 className="clinic-title">شفاخانه الفلاح </h1>
        
       <div className="header-contact">
  <p className="address">آدرس : کابل قلعه نجارا</p>
  <p className="phone">شماره تماس: 0789020202</p>
</div>
        <hr />
      </div>

      {/* ====== Info Section ====== */}
      <div className="print-info">
        <div>شماره نسخه: {data?.pres_num ?? "-"}</div>
        <div>مریض:    {data?.patient ?? "-"}</div>
        <div>سن:   {data?.age ?? "-"}</div>
        <div>گروپ خون:   {data?.blood_group ?? "-"}</div>
        <div>داکتر:   {data?.doctor ?? "-"}</div>
        <div>تاریخ:   {data?.date ?? "-"}</div>
      </div>

      {/* ====== Table ====== */}
      <table className="print-table">
        <thead>
          <tr>
            <th>شماره</th>
            <th>نوعیت</th>
            <th>نام دوا</th>
            <th>مقدار مصرف</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>قیمت کل</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.length > 0 ? (
            data.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item?.type ?? "-"}</td>
                <td>{item?.gen_name ?? item?.name ?? "-"}</td>
                <td>{item?.dosage ?? "-"}</td>
                <td>{item?.quantity ?? "-"}</td>
                <td>{item?.unit_price ?? "-"}</td>
                <td>{item?.total_price ?? "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">بدون اطلاعات</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ====== Footer ====== */}
      <div className="print-footer">
        <div>مجموع: {data?.total ?? 0}</div>
      </div>

    </div>
  );
});

export default PrescriptionPrint;
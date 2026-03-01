import React, { forwardRef } from "react";
import "./print.css";

const PrescriptionPrint = forwardRef(({ data }, ref) => {

  const genderValue = data?.gender?.toString().trim().toLowerCase();

  const genderFa =
    genderValue === "male" || genderValue === "m"
      ? "مرد"
      : genderValue === "female" || genderValue === "f"
      ? "زن"
      : genderValue ?? "-";

  return (
    <div ref={ref} className="print-container">

      <div className="print-header">
        <h1 className="clinic-title">شفاخانه الفلاح</h1>
        <div>
          <p>آدرس: کابل قلعه نجارا</p>
          <p>شماره تماس: 0789020202</p>
        </div>
        <hr />
      </div>

      <div className="print-info">
        <div>شماره نسخه: {data?.pres_num ?? "-"}</div>
        <div>مریض: {data?.patient ?? "-"}</div>
        <div>سن: {data?.age ?? "-"}</div>
        <div>جنسیت: {genderFa}</div>
        <div>گروپ خون: {data?.blood_group ?? "-"}</div>
        <div>داکتر: {data?.doctor ?? "-"}</div>
        <div>تاریخ: {data?.date ?? "-"}</div>
      </div>

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
                <td>{item?.gen_name ?? "-"}</td>
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

      <div>
        مجموع: {data?.total ?? 0}
      </div>

    </div>
  );
});

export default PrescriptionPrint;
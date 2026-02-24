
          {/* ===== اطلاعات فروش ===== */}
          <div className="form-container">
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>ثبت فروشات</h2>

            <div className="form-grid">
              <div>
                <label>تاریخ فروش</label>
                <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} />
              </div>

              <div>
                <label>مشتری</label>
                <select value={formItem.cust_id} onChange={e => handleChange("cust_id", e.target.value)}>
                  <option value="">-- انتخاب مشتری --</option>
                  {customers.map((c, index) => (
                    <option key={c.id ?? c.reg_id ?? `cust-${index}`} value={c.id ?? c.reg_id}>
                      {c.full_name ?? c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>مجموع فروش</label>
                <input type="number" value={totalSale} readOnly />
              </div>

              <div>
                <label>تخفیف</label>
                <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              </div>

              <div>
                <label>فروش خالص</label>
                <input type="number" value={netSales} readOnly />
              </div>

              <div>
                <label>پرداخت اولیه</label>
                <input type="number" value={totalPaid} onChange={e => setTotalPaid(Number(e.target.value))} />
              </div>

              <div>
                <label>باقی‌مانده</label>
                <input type="number" value={remaining} readOnly />
              </div>

              <div>
                <label>وضعیت پرداخت</label>
                <input type="text" value={paymentStatus} readOnly />
              </div>
            </div>
          </div>

          {/* ===== فرم آیتم‌ها ===== */}
          <div className="form-container">
            <h3>افزودن آیتم</h3>
            <div className="form-grid" onKeyDown={handleKeyDown}>

              <div>
                <label>کتگوری</label>
                <select value={formItem.category_id} onChange={e => handleChange("category_id", e.target.value)}>
                  <option value="">-- انتخاب کتگوری --</option>
                  {categories.map(c => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>دوا</label>
                <select value={formItem.med_id} onChange={e => handleChange("med_id", e.target.value)}>
                  <option value="">-- انتخاب دوا --</option>
                  {filteredMedications.map(m => (
                    <option key={m.med_id} value={m.med_id}>{m.gen_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>حمایت‌کننده</label>
                <select value={formItem.supplier_id} onChange={e => handleChange("supplier_id", e.target.value)}>
                  <option value="">-- انتخاب حمایت‌کننده --</option>
                  {filteredSuppliers.map((s, index) => (
                    <option key={s.reg_id ?? `sup-${index}`} value={s.reg_id}>
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
                <input type="number" value={formItem.unit_sales} onChange={e => handleChange("unit_sales", e.target.value)} />
              </div>

              <div>
                <label>قیمت مجموعی</label>
                <input type="number" value={formItem.total_sales} readOnly />
              </div>

              <div>
                <label>تاریخ انقضا</label>
                <input type="date" value={formItem.exp_date} onChange={e => handleChange("exp_date", e.target.value)} />
              </div>

            </div>
          </div>

          {/* ===== جدول آیتم‌ها ===== */}
          {saleItems.length > 0 && (
            <div className="table-container">
              <table className="dark-table">
                <thead>
                  <tr>
                    <th>شماره</th>
                    <th>کتگوری</th>
                    <th>نام دوا</th>
                    <th>حمایت‌کننده</th>
                    <th>نوع دوا</th>
                    <th>تعداد</th>
                    <th>قیمت واحد</th>
                    <th>قیمت مجموعی</th>
                    <th>تاریخ انقضا</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {saleItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>{item.category_name}</td>
                      <td>{item.med_name}</td>
                      <td>{item.supplier_name}</td>
                      <td>{item.type}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit_sales?.toLocaleString()}</td>
                      <td>{item.total_sales?.toLocaleString()}</td>
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
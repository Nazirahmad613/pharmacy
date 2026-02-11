CREATE OR REPLACE VIEW vw_hospital_reports AS

SELECT
    'transaction' AS source,
    j.id AS id,
    j.journal_date AS date,
    j.entry_type AS entry_type,
    j.ref_type AS ref_type,
    j.amount AS amount,
    j.description AS notes,
    p.reg_type AS patient_id,
    p.reg_type AS patient_name,
    d.reg_type AS doctor_id,
    d.reg_type AS doctor_name,
    m.med_id AS medication_id,
    m.gen_name AS medication_name,
    s.reg_type AS supplier_id,
    s.reg_type AS supplier_name,
    c.reg_type AS customer_id,
    c.reg_type AS customer_name,
    NULL AS quantity,
    NULL AS unit_price,
    NULL AS total_price
FROM journals j
LEFT JOIN registrations p ON j.patient_id = p.id AND p.reg_type='patient'
LEFT JOIN registrations d ON j.doc_id = d.id AND d.reg_type='doctor'
LEFT JOIN registrations c ON j.cust_id = c.id AND c.reg_type='customer'
LEFT JOIN registrations s ON j.supplier_id = s.id AND s.reg_type='supplier'
LEFT JOIN medications m ON j.med_id = m.med_id

UNION ALL

SELECT
    'sales' AS source,
    si.sales_it_id AS id,
    s.sales_date AS date,
    'debit' AS entry_type,
    'sales' AS ref_type,
    si.unit_sales * si.quantity AS amount,
    NULL AS notes,
    p.reg_id AS patient_id,
    p.full_name AS patient_name,
    d.reg_id AS doctor_id,
    d.full_name AS doctor_name,
    m.med_id AS medication_id,
    m.gen_name AS medication_name,
    sup.reg_id AS supplier_id,
    sup.full_name AS supplier_name,
    c.reg_id AS customer_id,
    c.full_name AS customer_name,
    si.quantity AS quantity,
    si.unit_sales AS unit_price,
    si.price * si.quantity AS total_price
FROM sales_items si
JOIN sales s ON si.sales_id = s.sales_id
JOIN medications m ON si.med_id = m.med_id
LEFT JOIN registrations sup ON m.supplier_id = sup.reg_id AND sup.reg_type='supplier'
LEFT JOIN registrations p ON s.patient_id = p.reg_id AND p.reg_type='patient'
LEFT JOIN registrations d ON s.doc_id = d.reg_id AND d.reg_type='doctor'
LEFT JOIN registrations c ON s.cust_id = c.reg_id AND c.reg_type='customer'

UNION ALL

SELECT
    'parchases' AS source,
    pi.parchase_it_id AS id,
    pur.parchase_date AS date,
    'credit' AS entry_type,
    'purchase' AS ref_type,
    pi.unit_price * pi.quantity AS amount,
    NULL AS notes,
    NULL AS patient_id,
    NULL AS patient_name,
    NULL AS doctor_id,
    NULL AS doctor_name,
    m.med_id AS medication_id,
    m.gen_name AS medication_name,
    sup.reg_id AS supplier_id,
    sup.full_name AS supplier_name,
    NULL AS customer_id,
    NULL AS customer_name,
    pi.quantity AS quantity,
    pi.unit_price AS unit_price,
    pi.unit_price * pi.quantity AS total_price
FROM parchaseitems pi
JOIN parchases pur ON pi.parchase_id = pur.parchase_id
JOIN medications m ON pi.med_id = m.med_id
LEFT JOIN registrations sup ON m.supplier_id = sup.reg_id AND sup.reg_type='supplier';

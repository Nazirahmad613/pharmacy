 CREATE OR REPLACE VIEW sales_full_details AS
SELECT
    s.sales_id AS sales_id,
    s.sales_date,
    s.cust_id,
    c.cust_name AS customer_name,
    c.cust_phone_num AS customer_phone,
    
    si.sales_it_id AS sale_item_id,
    si.med_id,
    m.gen_name AS medication_name,
    si.supplier_id,
    sup.name AS supplier_name,
    si.quantity,
    si.unit_sales AS unit_price,
    (si.quantity * si.total_sales) AS total_price,
    
    si.discount,
    ((si.quantity * si.unit_sales) - si.discount) AS net_price,
    
    COALESCE(p.total_paid, 0) AS total_paid,
    (((si.quantity * si.unit_sales) - si.discount) - COALESCE(p.total_paid, 0)) AS remaining_amount,
    
    s.notes AS sale_notes

FROM sales s
JOIN sales_items si ON si.sale_id = s.id
JOIN customers c ON c.id = s.cust_id
JOIN medications m ON m.id = si.med_id
JOIN suppliers sup ON sup.id = si.supplier_id
LEFT JOIN (
    SELECT sale_id, SUM(amount) AS total_paid
    FROM payments
    GROUP BY sale_id
) p ON p.sale_id = s.id;

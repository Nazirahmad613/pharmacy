  CREATE OR REPLACE VIEW sales_full_details AS
SELECT
       s.sales_id AS sales_id,                             -- شناسه فاکتور
    s.sales_date,                                  
    DATE_FORMAT(s.sales_id, '%Y-%m') AS month_year,  
    
    c.cust_id AS cust_id,                          
    c.cust_name AS cust_name,                     - 
    
    si.sales_it_id AS sale_item_id,                       
    si.med_id,                         
    m.gen_name AS medication_name,                
    si.quantity,                                
    si.unit_sales,                           
    si.total_sales,                         
    
    s.discount,                                 
    (si.total_sales - s.discount) AS net_price   
    
FROM sales s
JOIN sales_items si ON sales_id = si.sales_id
JOIN customers c ON s.cust_id = c.cust_id
LEFT JOIN medications m ON si.med_id = m.med_id

WHERE s.sales_id >= '2026-01-01'  
ORDER BY s.sales_id DESC, s.sales_id DESC, si.sales_id ASC;

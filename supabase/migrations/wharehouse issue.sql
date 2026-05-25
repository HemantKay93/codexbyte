INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity)
SELECT 
  p.id as product_id,
  (SELECT id FROM warehouses WHERE is_active = true LIMIT 1) as warehouse_id,
  100 as quantity,
  0 as reserved_quantity
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM inventory i WHERE i.product_id = p.id
);

-- Update the cached stock_quantity on the products table
UPDATE products p
SET stock_quantity = 100
WHERE stock_quantity = 0 OR stock_quantity IS NULL;
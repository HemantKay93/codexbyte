-- ============================================================
-- Seed Demo Data for New Admin Panel
-- ============================================================

DO $$
DECLARE
  user1_id UUID := gen_random_uuid();
  user2_id UUID := gen_random_uuid();
  product1_id UUID;
  product2_id UUID;
  order1_id UUID := gen_random_uuid();
  order2_id UUID := gen_random_uuid();
BEGIN
  -- Insert Demo Users
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user)
  VALUES
    (user1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.customer1@example.com', 'hashed', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Emma Watson"}', false, false),
    (user2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.customer2@example.com', 'hashed', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Liam Neeson"}', false, false)
  ON CONFLICT DO NOTHING;

  -- The triggers should have created user_profiles. Update them just in case.
  UPDATE public.user_profiles SET role = 'user' WHERE id IN (user1_id, user2_id);

  -- Get some existing products or insert new ones if none exist
  SELECT id INTO product1_id FROM public.products LIMIT 1;
  SELECT id INTO product2_id FROM public.products OFFSET 1 LIMIT 1;

  IF product1_id IS NOT NULL AND product2_id IS NOT NULL THEN
    -- Insert Orders
    INSERT INTO public.orders (id, user_id, order_number, status, payment_status, subtotal, tax_amount, shipping_amount, total_amount, payment_method)
    VALUES
      (order1_id, user1_id, 'ORD-DEMO-101', 'processing', 'captured', 149.00, 10.00, 5.00, 164.00, 'credit_card'),
      (order2_id, user2_id, 'ORD-DEMO-102', 'pending', 'pending', 2199.99, 150.00, 0.00, 2349.99, 'bank_transfer')
    ON CONFLICT DO NOTHING;

    -- Insert Order Items
    INSERT INTO public.order_items (order_id, product_id, product_name, sku, quantity, unit_price, total_price)
    VALUES
      (order1_id, product1_id, 'Demo Product 1', 'SKU-01', 1, 149.00, 149.00),
      (order2_id, product2_id, 'Demo Product 2', 'SKU-02', 2, 1099.99, 2199.98)
    ON CONFLICT DO NOTHING;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo data insertion failed: %', SQLERRM;
END $$;

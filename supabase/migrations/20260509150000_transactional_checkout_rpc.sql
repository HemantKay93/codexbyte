-- ============================================================
-- Transactional Checkout RPC
-- Creates an order, order items, stock movements, and inventory
-- decrements in one database transaction.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_user_id UUID,
  p_order_number TEXT,
  p_status TEXT,
  p_payment_status TEXT,
  p_payment_method TEXT,
  p_shipping_address JSONB,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_shipping_amount NUMERIC,
  p_warehouse_id UUID,
  p_items JSONB
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
  v_item JSONB;
  v_product public.products;
  v_inventory_id UUID;
  v_available INTEGER;
  v_quantity INTEGER;
  v_unit_price NUMERIC(12,2);
  v_subtotal NUMERIC(12,2) := 0;
  v_tax NUMERIC(12,2) := 0;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must include at least one item' USING ERRCODE = '22023';
  END IF;

  IF p_warehouse_id IS NULL THEN
    SELECT id INTO p_warehouse_id
    FROM public.warehouses
    WHERE is_active = true
    ORDER BY created_at
    LIMIT 1;
  END IF;

  IF p_warehouse_id IS NULL THEN
    RAISE EXCEPTION 'No active warehouse found' USING ERRCODE = '22023';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := COALESCE((v_item->>'quantity')::INTEGER, 0);
    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid item quantity' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'productId')::UUID
      AND COALESCE(status, 'active') = 'active'
    FOR UPDATE;

    IF v_product.id IS NULL THEN
      RAISE EXCEPTION 'Product % is not available', v_item->>'productId' USING ERRCODE = '22023';
    END IF;

    SELECT id, quantity INTO v_inventory_id, v_available
    FROM public.inventory
    WHERE product_id = v_product.id
      AND warehouse_id = p_warehouse_id
    FOR UPDATE;

    IF v_inventory_id IS NULL THEN
      v_available := COALESCE(v_product.stock_quantity, 0);
      INSERT INTO public.inventory (product_id, warehouse_id, quantity)
      VALUES (v_product.id, p_warehouse_id, v_available)
      RETURNING id INTO v_inventory_id;
    END IF;

    IF v_available < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%": requested %, available %',
        v_product.name, v_quantity, v_available USING ERRCODE = '22023';
    END IF;

    v_unit_price := v_product.price;
    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
  END LOOP;

  v_tax := ROUND(v_subtotal * 0.18, 2);

  INSERT INTO public.orders (
    user_id,
    order_number,
    status,
    payment_status,
    subtotal,
    tax_amount,
    shipping_amount,
    total_amount,
    payment_method,
    shipping_address,
    customer_name,
    customer_email
  )
  VALUES (
    p_user_id,
    COALESCE(p_order_number, 'ORD-' || EXTRACT(EPOCH FROM clock_timestamp())::BIGINT::TEXT),
    COALESCE(p_status, 'pending')::public.order_status,
    COALESCE(p_payment_status, 'pending')::public.payment_status,
    v_subtotal,
    v_tax,
    COALESCE(p_shipping_amount, 0),
    v_subtotal + v_tax + COALESCE(p_shipping_amount, 0),
    COALESCE(p_payment_method, 'cash'),
    p_shipping_address,
    COALESCE(p_customer_name, 'Walk-in Customer'),
    COALESCE(p_customer_email, 'walkin@customer.com')
  )
  RETURNING * INTO v_order;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'productId')::UUID;

    SELECT id INTO v_inventory_id
    FROM public.inventory
    WHERE product_id = v_product.id
      AND warehouse_id = p_warehouse_id
    FOR UPDATE;

    UPDATE public.inventory
    SET quantity = quantity - v_quantity,
        updated_at = now()
    WHERE id = v_inventory_id;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      sku,
      quantity,
      unit_price,
      total_price
    )
    VALUES (
      v_order.id,
      v_product.id,
      v_product.name,
      COALESCE(v_product.sku, ''),
      v_quantity,
      v_product.price,
      v_product.price * v_quantity
    );

    INSERT INTO public.stock_movements (
      inventory_id,
      type,
      quantity,
      reference_type,
      reference_id,
      performed_by
    )
    VALUES (
      v_inventory_id,
      'out',
      -v_quantity,
      'order',
      v_order.id::TEXT,
      p_user_id
    );
  END LOOP;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order(
  UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, NUMERIC, UUID, JSONB
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_checkout_order(
  UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, NUMERIC, UUID, JSONB
) TO authenticated;

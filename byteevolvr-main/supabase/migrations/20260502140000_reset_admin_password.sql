-- ============================================================
-- Reset admin user password to: admin123
-- ============================================================
DO $$
BEGIN
  UPDATE auth.users
  SET
    encrypted_password = crypt('admin123', gen_salt('bf', 10)),
    updated_at = now()
  WHERE email = 'admin@byteevolvr.com';

  -- Also insert the user if they somehow don't exist
  IF NOT FOUND THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@byteevolvr.com',
      crypt('admin123', gen_salt('bf', 10)),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin User", "role": "admin"}',
      FALSE
    );
    RAISE NOTICE 'Admin user created fresh.';
  ELSE
    RAISE NOTICE 'Admin user password reset to admin123.';
  END IF;
END $$;

-- Debug script to check admin status
SELECT id, email, raw_user_meta_data, raw_app_meta_data 
FROM auth.users 
WHERE email = 'admin@byteevolvr.com';

-- Check if the current user (if any) is an admin
SELECT auth.uid(), public.is_admin();

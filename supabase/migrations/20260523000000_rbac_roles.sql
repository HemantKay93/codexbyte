-- Phase 8: RBAC Roles (Part 1 - Run this first!)
-- You MUST run this block by itself first because Postgres requires new ENUM values to be committed before they can be used as defaults.
-- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super-admin';
-- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'manager';
-- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'warehouse-staff';
-- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'customer';


/*
-------------------------------------------------------------------------------------
STOP HERE! 
Run the above code first. Once it succeeds, delete the above code from the editor, 
paste the code below, and run it.
-------------------------------------------------------------------------------------
*/

-- Phase 8: RBAC Roles (Part 2 - Run this second!)
-- Update the default behavior in user_profiles to default to customer instead of user
ALTER TABLE public.user_profiles ALTER COLUMN role SET DEFAULT 'customer'::public.user_role;

-- Update the handle_new_user trigger to default to 'customer' if role is not provided in metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::public.user_role
  );
  RETURN NEW;
END;
$$;

-- Create is_super_admin function using plpgsql to avoid enum validation issue
CREATE OR REPLACE FUNCTION public.is_super_admin(auth_uid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_user_id = auth_uid AND ur.role::text = 'super_admin'
  );
END;
$$;

-- Update is_admin to also return true for super_admins
CREATE OR REPLACE FUNCTION public.is_admin(auth_uid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_user_id = auth_uid AND ur.role::text IN ('admin', 'super_admin')
  );
END;
$$;
-- Drop old insert/delete policies on user_roles
DROP POLICY IF EXISTS "Admins can create roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Super admins can assign/remove any role
CREATE POLICY "Super admins can create any role"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete any role"
ON public.user_roles FOR DELETE
TO authenticated
USING (is_super_admin(auth.uid()));

-- Branch admins can assign/remove attendance_taker and minutes_taker only
CREATE POLICY "Admins can create limited roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) 
  AND role::text IN ('attendance_taker', 'minutes_taker')
);

CREATE POLICY "Admins can delete limited roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid()) 
  AND role::text IN ('attendance_taker', 'minutes_taker')
);
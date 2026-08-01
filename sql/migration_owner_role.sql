ALTER TABLE public.admin_users
DROP CONSTRAINT IF EXISTS admin_users_role_check;

ALTER TABLE public.admin_users
ADD CONSTRAINT admin_users_role_check
CHECK (role = ANY (ARRAY['admin'::text, 'superadmin'::text, 'staff'::text, 'chef'::text, 'owner'::text]));

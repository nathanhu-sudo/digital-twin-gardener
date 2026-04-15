
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Convenience function for admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS: admins see all roles, users see only their own
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed admin role for nathan.hr.hu@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'nathan.hr.hu@gmail.com'
ON CONFLICT DO NOTHING;

-- Admin function to get all users with their stats
CREATE OR REPLACE FUNCTION public.get_admin_users_overview()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  total_items BIGINT,
  active_items BIGINT,
  consumed_items BIGINT,
  tossed_items BIGINT,
  total_saved_kg NUMERIC,
  total_wasted_kg NUMERIC,
  last_activity TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.email,
    COUNT(p.id) AS total_items,
    COUNT(p.id) FILTER (WHERE p.status = 'active') AS active_items,
    COUNT(p.id) FILTER (WHERE p.status = 'consumed') AS consumed_items,
    COUNT(p.id) FILTER (WHERE p.status = 'tossed') AS tossed_items,
    COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status = 'consumed'), 0) AS total_saved_kg,
    COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status = 'tossed'), 0) AS total_wasted_kg,
    MAX(p.created_at) AS last_activity
  FROM auth.users u
  LEFT JOIN public.pantry_items p ON p.user_id = u.id
  WHERE public.has_role(auth.uid(), 'admin')
  GROUP BY u.id, u.email
$$;

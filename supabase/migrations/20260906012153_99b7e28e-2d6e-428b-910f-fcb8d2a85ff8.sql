DROP FUNCTION IF EXISTS public.get_admin_users_overview();

CREATE FUNCTION public.get_admin_users_overview()
RETURNS TABLE(
  user_id uuid,
  email text,
  display_name text,
  plan text,
  plan_status text,
  is_lifetime boolean,
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  total_items bigint,
  active_items bigint,
  consumed_items bigint,
  tossed_items bigint,
  total_saved_kg numeric,
  total_wasted_kg numeric,
  last_activity timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text,
    p.display_name,
    COALESCE(s.plan, 'free') AS plan,
    COALESCE(s.status, 'active') AS plan_status,
    COALESCE(s.is_lifetime, false) AS is_lifetime,
    u.created_at AS joined_at,
    u.last_sign_in_at,
    COUNT(p2.id) AS total_items,
    COUNT(p2.id) FILTER (WHERE p2.status = 'active') AS active_items,
    COUNT(p2.id) FILTER (WHERE p2.status = 'consumed') AS consumed_items,
    COUNT(p2.id) FILTER (WHERE p2.status = 'tossed') AS tossed_items,
    COALESCE(SUM(p2.weight_kg) FILTER (WHERE p2.status = 'consumed'), 0) AS total_saved_kg,
    COALESCE(SUM(p2.weight_kg) FILTER (WHERE p2.status = 'tossed'), 0) AS total_wasted_kg,
    MAX(p2.created_at) AS last_activity
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
  LEFT JOIN public.pantry_items p2 ON p2.user_id = u.id
  GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, p.display_name, s.plan, s.status, s.is_lifetime;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_admin_users_overview() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_users_overview() FROM PUBLIC, anon;
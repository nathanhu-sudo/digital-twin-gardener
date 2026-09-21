CREATE TABLE IF NOT EXISTS public.user_geo (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  signup_ip text,
  signup_country text,
  signup_country_code text,
  signup_region text,
  signup_city text,
  signup_timezone text,
  signup_org text,
  last_ip text,
  last_country text,
  last_country_code text,
  last_region text,
  last_city text,
  last_timezone text,
  last_org text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  vpn_suspected boolean NOT NULL DEFAULT false,
  vpn_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_geo TO authenticated;
GRANT ALL ON public.user_geo TO service_role;

ALTER TABLE public.user_geo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view all geo" ON public.user_geo;
CREATE POLICY "Admins view all geo" ON public.user_geo
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.get_admin_users_overview();
CREATE OR REPLACE FUNCTION public.get_admin_users_overview()
 RETURNS TABLE(user_id uuid, email text, display_name text, avatar_url text, plan text, plan_status text, is_lifetime boolean, plan_started_at timestamp with time zone, plan_expires_at timestamp with time zone, tags text[], joined_at timestamp with time zone, last_sign_in_at timestamp with time zone, total_items bigint, active_items bigint, consumed_items bigint, tossed_items bigint, total_saved_kg numeric, total_wasted_kg numeric, last_activity timestamp with time zone, signup_country text, signup_country_code text, signup_city text, signup_region text, signup_ip text, last_country text, last_country_code text, last_city text, last_ip text, last_org text, vpn_suspected boolean, vpn_reason text)
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
    p.avatar_url,
    COALESCE(s.plan, 'free') AS plan,
    COALESCE(s.status, 'active') AS plan_status,
    COALESCE(s.is_lifetime, false) AS is_lifetime,
    s.started_at AS plan_started_at,
    s.expires_at AS plan_expires_at,
    COALESCE((SELECT array_agg(t.tag ORDER BY t.created_at) FROM public.user_tags t WHERE t.user_id = u.id), '{}'::text[]) AS tags,
    u.created_at AS joined_at,
    u.last_sign_in_at,
    COUNT(p2.id) AS total_items,
    COUNT(p2.id) FILTER (WHERE p2.status = 'active') AS active_items,
    COUNT(p2.id) FILTER (WHERE p2.status = 'consumed') AS consumed_items,
    COUNT(p2.id) FILTER (WHERE p2.status = 'tossed') AS tossed_items,
    COALESCE(SUM(p2.weight_kg) FILTER (WHERE p2.status = 'consumed'), 0) AS total_saved_kg,
    COALESCE(SUM(p2.weight_kg) FILTER (WHERE p2.status = 'tossed'), 0) AS total_wasted_kg,
    MAX(p2.created_at) AS last_activity,
    g.signup_country, g.signup_country_code, g.signup_city, g.signup_region, g.signup_ip,
    g.last_country, g.last_country_code, g.last_city, g.last_ip, g.last_org,
    COALESCE(g.vpn_suspected, false), g.vpn_reason
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
  LEFT JOIN public.user_geo g ON g.user_id = u.id
  LEFT JOIN public.pantry_items p2 ON p2.user_id = u.id
  GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, p.display_name, p.avatar_url, s.plan, s.status, s.is_lifetime, s.started_at, s.expires_at,
    g.signup_country, g.signup_country_code, g.signup_city, g.signup_region, g.signup_ip,
    g.last_country, g.last_country_code, g.last_city, g.last_ip, g.last_org, g.vpn_suspected, g.vpn_reason;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_admin_users_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users_overview() TO authenticated;
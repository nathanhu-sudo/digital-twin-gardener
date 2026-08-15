-- Explicit authorization guard for the admin overview report
CREATE OR REPLACE FUNCTION public.get_admin_users_overview()
 RETURNS TABLE(user_id uuid, email text, total_items bigint, active_items bigint, consumed_items bigint, tossed_items bigint, total_saved_kg numeric, total_wasted_kg numeric, last_activity timestamp with time zone)
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
    COUNT(p.id) AS total_items,
    COUNT(p.id) FILTER (WHERE p.status = 'active') AS active_items,
    COUNT(p.id) FILTER (WHERE p.status = 'consumed') AS consumed_items,
    COUNT(p.id) FILTER (WHERE p.status = 'tossed') AS tossed_items,
    COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status = 'consumed'), 0) AS total_saved_kg,
    COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status = 'tossed'), 0) AS total_wasted_kg,
    MAX(p.created_at) AS last_activity
  FROM auth.users u
  LEFT JOIN public.pantry_items p ON p.user_id = u.id
  GROUP BY u.id, u.email;
END;
$function$;

-- Internal helpers: not callable by app clients
REVOKE ALL ON FUNCTION public.get_admin_users_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_user_stats(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- User-facing RPCs: signed-in only (each enforces auth.uid() ownership internally)
REVOKE ALL ON FUNCTION public.check_and_unlock_achievements(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_weekly_bonus(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_community_impact() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_friends() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_leaderboard(text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_weekly_challenges(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.search_members(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_admin_users_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_weekly_bonus(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_impact() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friends() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_challenges(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_members(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
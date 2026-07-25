-- Add explicit authentication guards inside SECURITY DEFINER functions that lacked them

CREATE OR REPLACE FUNCTION public.get_community_impact()
 RETURNS TABLE(total_users bigint, total_items bigint, total_saved_kg numeric, total_wasted_kg numeric, total_co2_saved_kg numeric, total_co2_wasted_kg numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(DISTINCT pi.user_id) AS total_users,
    COUNT(*) AS total_items,
    COALESCE(SUM(CASE WHEN pi.status = 'consumed' THEN pi.weight_kg ELSE 0 END), 0) AS total_saved_kg,
    COALESCE(SUM(CASE WHEN pi.status = 'tossed' THEN pi.weight_kg ELSE 0 END), 0) AS total_wasted_kg,
    COALESCE(SUM(CASE WHEN pi.status = 'consumed' THEN
      pi.weight_kg * CASE pi.co2_impact WHEN 'high' THEN 27.0 WHEN 'medium' THEN 3.2 WHEN 'low' THEN 0.9 ELSE 0 END
    ELSE 0 END), 0) AS total_co2_saved_kg,
    COALESCE(SUM(CASE WHEN pi.status = 'tossed' THEN
      pi.weight_kg * CASE pi.co2_impact WHEN 'high' THEN 27.0 WHEN 'medium' THEN 3.2 WHEN 'low' THEN 0.9 ELSE 0 END
    ELSE 0 END), 0) AS total_co2_wasted_kg
  FROM public.pantry_items pi;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_leaderboard(_period text)
 RETURNS TABLE(user_id uuid, display_name text, kg_saved numeric, items_consumed bigint, rank bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_start TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF _period = 'all' THEN
    v_start := 'epoch'::timestamptz;
  ELSIF _period = 'month' THEN
    v_start := now() - INTERVAL '30 days';
  ELSE
    v_start := now() - INTERVAL '7 days';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id,
    COALESCE(NULLIF(TRIM(pr.display_name), ''), 'Anonymous')::TEXT AS display_name,
    COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status='consumed'), 0)::NUMERIC AS kg_saved,
    COUNT(*) FILTER (WHERE p.status='consumed')::BIGINT AS items_consumed,
    RANK() OVER (ORDER BY COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status='consumed'),0) DESC)::BIGINT AS rank
  FROM public.pantry_items p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.created_at >= v_start
  GROUP BY p.user_id, pr.display_name
  HAVING COUNT(*) FILTER (WHERE p.status IN ('consumed','tossed')) > 0
  ORDER BY kg_saved DESC
  LIMIT 50;
END;
$function$;

-- Least privilege: no PUBLIC/anon execute on any privileged function
REVOKE ALL ON FUNCTION public.get_community_impact() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_leaderboard(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_weekly_challenges(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_weekly_bonus(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.check_and_unlock_achievements(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_admin_users_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_user_stats(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_community_impact() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_challenges(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_weekly_bonus(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
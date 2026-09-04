-- Community weekly trend: last 4 weeks of saved vs wasted kg
CREATE OR REPLACE FUNCTION public.get_community_weekly_trend()
 RETURNS TABLE(week_start date, saved_kg numeric, wasted_kg numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH weeks AS (
    SELECT generate_series(
      date_trunc('week', now() AT TIME ZONE 'UTC') - interval '3 weeks',
      date_trunc('week', now() AT TIME ZONE 'UTC'),
      interval '1 week'
    )::date AS week_start
  )
  SELECT
    w.week_start,
    COALESCE(SUM(CASE WHEN pi.status = 'consumed' THEN pi.weight_kg ELSE 0 END), 0) AS saved_kg,
    COALESCE(SUM(CASE WHEN pi.status = 'tossed' THEN pi.weight_kg ELSE 0 END), 0) AS wasted_kg
  FROM weeks w
  LEFT JOIN public.pantry_items pi ON date_trunc('week', pi.created_at AT TIME ZONE 'UTC')::date = w.week_start
    AND pi.status IN ('consumed', 'tossed')
  GROUP BY w.week_start
  ORDER BY w.week_start;
END;
$function$;

-- Community top contributors: top 5 users by kg saved
CREATE OR REPLACE FUNCTION public.get_community_top_contributors()
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, kg_saved numeric, items_consumed bigint, rank bigint)
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
    p.user_id,
    COALESCE(NULLIF(TRIM(pr.display_name), ''), 'Anonymous')::TEXT AS display_name,
    pr.avatar_url::TEXT AS avatar_url,
    COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status = 'consumed'), 0)::NUMERIC AS kg_saved,
    COUNT(*) FILTER (WHERE p.status = 'consumed')::BIGINT AS items_consumed,
    RANK() OVER (ORDER BY COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status = 'consumed'), 0) DESC)::BIGINT AS rank
  FROM public.pantry_items p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.status = 'consumed'
  GROUP BY p.user_id, pr.display_name, pr.avatar_url
  ORDER BY kg_saved DESC
  LIMIT 5;
END;
$function$;

-- Community common items: 5 most tracked item names
CREATE OR REPLACE FUNCTION public.get_community_common_items()
 RETURNS TABLE(name text, count bigint, total_kg numeric)
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
    pi.name,
    COUNT(*)::BIGINT AS count,
    COALESCE(SUM(pi.weight_kg), 0)::NUMERIC AS total_kg
  FROM public.pantry_items pi
  GROUP BY pi.name
  ORDER BY count DESC, total_kg DESC
  LIMIT 5;
END;
$function$;

-- Least privilege: no PUBLIC/anon execute on privileged functions
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_user_stats(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_admin_users_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.check_and_unlock_achievements(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_weekly_bonus(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_community_impact() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_community_weekly_trend() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_community_top_contributors() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_community_common_items() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_friends() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_leaderboard(text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_weekly_challenges(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.search_members(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_admin_users_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_weekly_bonus(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_impact() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_weekly_trend() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_top_contributors() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_common_items() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friends() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_challenges(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_members(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
CREATE OR REPLACE FUNCTION public.get_weekly_challenges(_user_id uuid)
 RETURNS TABLE(key text, name text, description text, icon text, type text, target numeric, progress numeric, completed boolean, xp_reward integer, sort_order integer, week_start date, week_end date, all_completed boolean, bonus_xp integer, week_streak integer, bonus_claimed boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_week_start date := DATE_TRUNC('week', now())::date;
  v_week_end   date := (DATE_TRUNC('week', now()) + INTERVAL '6 days')::date;
  v_streak     integer := 0;
  v_bonus      integer := 0;
  v_claimed    boolean := false;
BEGIN
  SELECT COALESCE(ucs.week_streak, 0) INTO v_streak
  FROM public.user_challenge_streaks ucs WHERE ucs.user_id = _user_id;
  IF v_streak IS NULL THEN v_streak := 0; END IF;

  v_bonus := 50 + (v_streak * 25);

  v_claimed := EXISTS (
    SELECT 1 FROM public.user_challenge_bonuses ucb
    WHERE ucb.user_id = _user_id AND ucb.week_start = v_week_start
  );

  RETURN QUERY
  WITH base AS (
    SELECT cd.*,
      CASE cd.type
        WHEN 'kg_saved' THEN
          COALESCE((SELECT SUM(pi.weight_kg) FROM public.pantry_items pi
                    WHERE pi.user_id = _user_id AND pi.status='consumed'
                      AND pi.created_at >= v_week_start
                      AND pi.created_at <  v_week_end + INTERVAL '1 day'), 0)
        WHEN 'items_consumed' THEN
          COALESCE((SELECT COUNT(*) FROM public.pantry_items pi
                    WHERE pi.user_id = _user_id AND pi.status='consumed'
                      AND pi.created_at >= v_week_start
                      AND pi.created_at <  v_week_end + INTERVAL '1 day'), 0)
        WHEN 'zero_waste' THEN
          (SELECT COUNT(DISTINCT d) FROM generate_series(v_week_start, LEAST(v_week_end, CURRENT_DATE), '1 day'::interval) d
            WHERE NOT EXISTS (
              SELECT 1 FROM public.pantry_items pi
              WHERE pi.user_id = _user_id AND pi.status='tossed'
                AND DATE(pi.created_at) = d::date
            ))
        WHEN 'new_items' THEN
          (SELECT COUNT(*) FROM (
            SELECT DISTINCT LOWER(pi.name) AS n FROM public.pantry_items pi
            WHERE pi.user_id = _user_id
              AND pi.created_at >= v_week_start
              AND pi.created_at <  v_week_end + INTERVAL '1 day'
              AND LOWER(pi.name) NOT IN (
                SELECT DISTINCT LOWER(pi2.name) FROM public.pantry_items pi2
                WHERE pi2.user_id = _user_id AND pi2.created_at < v_week_start
              )
          ) sub)
        ELSE 0
      END::numeric AS progress_val,
      CASE cd.type WHEN 'zero_waste' THEN 7 ELSE cd.target END::numeric AS effective_target
    FROM public.challenge_definitions cd
    WHERE cd.active = true
  )
  SELECT
    b.key, b.name, b.description, b.icon, b.type,
    b.effective_target AS target,
    LEAST(b.progress_val, b.effective_target) AS progress,
    (b.progress_val >= b.effective_target) AS completed,
    b.xp_reward,
    b.sort_order,
    v_week_start, v_week_end,
    (SELECT bool_and(x.progress_val >= x.effective_target) FROM base x) AS all_completed,
    v_bonus,
    v_streak,
    v_claimed
  FROM base b
  ORDER BY b.sort_order;
END;
$function$;
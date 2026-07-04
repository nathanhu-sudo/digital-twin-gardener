
-- 1. Leaderboard: return display_name from profiles, not email from auth.users
DROP FUNCTION IF EXISTS public.get_leaderboard(text);

CREATE OR REPLACE FUNCTION public.get_leaderboard(_period text)
 RETURNS TABLE(user_id uuid, display_name text, kg_saved numeric, items_consumed bigint, rank bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_start TIMESTAMPTZ;
BEGIN
  IF _period = 'month' THEN
    v_start := DATE_TRUNC('month', now());
  ELSE
    v_start := DATE_TRUNC('week', now());
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

REVOKE ALL ON FUNCTION public.get_leaderboard(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;

-- 2. Ownership guards on user-scoped SECURITY DEFINER RPCs
CREATE OR REPLACE FUNCTION public.recompute_user_stats(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_consumed INT;
  v_tossed INT;
  v_kg_saved NUMERIC;
  v_kg_wasted NUMERIC;
  v_xp INT;
  v_bonus_xp INT := 0;
  v_level INT;
  v_current_streak INT := 0;
  v_longest_streak INT := 0;
  v_run INT := 0;
  v_prev_day DATE;
  v_today DATE := CURRENT_DATE;
  rec RECORD;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE status='consumed'),
    COUNT(*) FILTER (WHERE status='tossed'),
    COALESCE(SUM(weight_kg) FILTER (WHERE status='consumed'),0),
    COALESCE(SUM(weight_kg) FILTER (WHERE status='tossed'),0)
  INTO v_consumed, v_tossed, v_kg_saved, v_kg_wasted
  FROM public.pantry_items WHERE user_id = _user_id;

  SELECT COALESCE(SUM(xp_awarded), 0) INTO v_bonus_xp
  FROM public.user_challenge_bonuses WHERE user_id = _user_id;

  v_xp := GREATEST(0, FLOOR(v_kg_saved * 10) + (v_consumed * 25) - (v_tossed * 5))::INT + v_bonus_xp;
  v_level := 1 + FLOOR(v_xp / 250.0)::INT;

  v_prev_day := NULL;
  FOR rec IN
    SELECT DISTINCT DATE(created_at) AS d
    FROM public.pantry_items
    WHERE user_id = _user_id AND status = 'consumed'
    ORDER BY d DESC
  LOOP
    IF v_prev_day IS NULL THEN
      IF rec.d = v_today OR rec.d = v_today - 1 THEN
        v_run := 1; v_current_streak := 1;
      ELSE EXIT; END IF;
    ELSE
      IF rec.d = v_prev_day - 1 THEN
        v_run := v_run + 1; v_current_streak := v_run;
      ELSE EXIT; END IF;
    END IF;
    v_prev_day := rec.d;
  END LOOP;

  v_run := 0; v_prev_day := NULL;
  FOR rec IN
    SELECT DISTINCT DATE(created_at) AS d
    FROM public.pantry_items
    WHERE user_id = _user_id AND status = 'consumed'
    ORDER BY d ASC
  LOOP
    IF v_prev_day IS NULL OR rec.d = v_prev_day + 1 THEN
      v_run := v_run + 1;
    ELSE
      v_run := 1;
    END IF;
    IF v_run > v_longest_streak THEN v_longest_streak := v_run; END IF;
    v_prev_day := rec.d;
  END LOOP;

  INSERT INTO public.user_stats (user_id, xp, level, current_streak, longest_streak, last_activity_date, items_consumed, items_tossed, kg_saved, kg_wasted, updated_at)
  VALUES (_user_id, v_xp, v_level, v_current_streak, v_longest_streak, v_today, v_consumed, v_tossed, v_kg_saved, v_kg_wasted, now())
  ON CONFLICT (user_id) DO UPDATE SET
    xp = EXCLUDED.xp,
    level = EXCLUDED.level,
    current_streak = EXCLUDED.current_streak,
    longest_streak = GREATEST(public.user_stats.longest_streak, EXCLUDED.longest_streak),
    last_activity_date = EXCLUDED.last_activity_date,
    items_consumed = EXCLUDED.items_consumed,
    items_tossed = EXCLUDED.items_tossed,
    kg_saved = EXCLUDED.kg_saved,
    kg_wasted = EXCLUDED.kg_wasted,
    updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(_user_id uuid)
 RETURNS TABLE(key text, name text, icon text, tier text, xp_reward integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  s RECORD;
  a RECORD;
  v_save_rate NUMERIC;
  v_distinct_items INT;
  v_total_kg NUMERIC;
  v_qualifies BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  PERFORM public.recompute_user_stats(_user_id);
  SELECT * INTO s FROM public.user_stats WHERE user_id = _user_id;
  IF s IS NULL THEN RETURN; END IF;

  v_total_kg := s.kg_saved + s.kg_wasted;
  v_save_rate := CASE WHEN v_total_kg > 0 THEN (s.kg_saved / v_total_kg) * 100 ELSE 0 END;
  SELECT COUNT(DISTINCT LOWER(pi.name)) INTO v_distinct_items
    FROM public.pantry_items pi WHERE pi.user_id = _user_id;

  FOR a IN SELECT * FROM public.achievements LOOP
    IF EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = _user_id AND ua.achievement_id = a.id) THEN
      CONTINUE;
    END IF;

    v_qualifies := FALSE;
    IF a.criteria->>'type' = 'items_consumed' THEN
      v_qualifies := s.items_consumed >= (a.criteria->>'value')::INT;
    ELSIF a.criteria->>'type' = 'kg_saved' THEN
      v_qualifies := s.kg_saved >= (a.criteria->>'value')::NUMERIC;
    ELSIF a.criteria->>'type' = 'streak' THEN
      v_qualifies := s.longest_streak >= (a.criteria->>'value')::INT;
    ELSIF a.criteria->>'type' = 'save_rate' THEN
      v_qualifies := v_save_rate >= (a.criteria->>'value')::NUMERIC AND s.items_consumed >= 5;
    ELSIF a.criteria->>'type' = 'level' THEN
      v_qualifies := s.level >= (a.criteria->>'value')::INT;
    ELSIF a.criteria->>'type' = 'distinct_items' THEN
      v_qualifies := v_distinct_items >= (a.criteria->>'value')::INT;
    END IF;

    IF v_qualifies THEN
      INSERT INTO public.user_achievements (user_id, achievement_id) VALUES (_user_id, a.id);
      key := a.key; name := a.name; icon := a.icon; tier := a.tier; xp_reward := a.xp_reward;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$function$;

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
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

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

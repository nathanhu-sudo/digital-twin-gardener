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
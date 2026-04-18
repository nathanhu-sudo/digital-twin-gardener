
-- Achievements catalog
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  criteria JSONB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements readable by all authenticated"
ON public.achievements FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only admins can manage achievements"
ON public.achievements FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User unlocked achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own achievements"
ON public.user_achievements FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own achievements"
ON public.user_achievements FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- User stats
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  items_consumed INTEGER NOT NULL DEFAULT 0,
  items_tossed INTEGER NOT NULL DEFAULT 0,
  kg_saved NUMERIC NOT NULL DEFAULT 0,
  kg_wasted NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own stats"
ON public.user_stats FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users upsert own stats"
ON public.user_stats FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own stats"
ON public.user_stats FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Recompute user stats from pantry_items
CREATE OR REPLACE FUNCTION public.recompute_user_stats(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_consumed INT;
  v_tossed INT;
  v_kg_saved NUMERIC;
  v_kg_wasted NUMERIC;
  v_xp INT;
  v_level INT;
  v_current_streak INT := 0;
  v_longest_streak INT := 0;
  v_run INT := 0;
  v_prev_day DATE;
  v_today DATE := CURRENT_DATE;
  rec RECORD;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE status='consumed'),
    COUNT(*) FILTER (WHERE status='tossed'),
    COALESCE(SUM(weight_kg) FILTER (WHERE status='consumed'),0),
    COALESCE(SUM(weight_kg) FILTER (WHERE status='tossed'),0)
  INTO v_consumed, v_tossed, v_kg_saved, v_kg_wasted
  FROM public.pantry_items WHERE user_id = _user_id;

  -- XP: 10 per kg saved, 25 per consumed item, -5 per tossed item (min 0)
  v_xp := GREATEST(0, FLOOR(v_kg_saved * 10) + (v_consumed * 25) - (v_tossed * 5))::INT;
  -- Level: every 250 XP = 1 level
  v_level := 1 + FLOOR(v_xp / 250.0)::INT;

  -- Streak: consecutive days with at least one 'consumed' action, ending today or yesterday
  v_prev_day := NULL;
  FOR rec IN
    SELECT DISTINCT DATE(created_at) AS d
    FROM public.pantry_items
    WHERE user_id = _user_id AND status = 'consumed'
    ORDER BY d DESC
  LOOP
    IF v_prev_day IS NULL THEN
      IF rec.d = v_today OR rec.d = v_today - 1 THEN
        v_run := 1;
        v_current_streak := 1;
      ELSE
        EXIT;
      END IF;
    ELSE
      IF rec.d = v_prev_day - 1 THEN
        v_run := v_run + 1;
        v_current_streak := v_run;
      ELSE
        EXIT;
      END IF;
    END IF;
    v_prev_day := rec.d;
  END LOOP;

  -- Longest streak across all history
  v_run := 0;
  v_prev_day := NULL;
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
    IF v_run > v_longest_streak THEN
      v_longest_streak := v_run;
    END IF;
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
$$;

-- Check & unlock achievements; returns array of newly unlocked achievement keys
CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(_user_id UUID)
RETURNS TABLE(key TEXT, name TEXT, icon TEXT, tier TEXT, xp_reward INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  SELECT COUNT(DISTINCT LOWER(name)) INTO v_distinct_items
    FROM public.pantry_items WHERE user_id = _user_id;

  FOR a IN SELECT * FROM public.achievements LOOP
    IF EXISTS (SELECT 1 FROM public.user_achievements WHERE user_id = _user_id AND achievement_id = a.id) THEN
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
$$;

-- Leaderboard for current week or month
CREATE OR REPLACE FUNCTION public.get_leaderboard(_period TEXT)
RETURNS TABLE(user_id UUID, email TEXT, kg_saved NUMERIC, items_consumed BIGINT, rank BIGINT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
    u.email::TEXT,
    COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status='consumed'), 0)::NUMERIC AS kg_saved,
    COUNT(*) FILTER (WHERE p.status='consumed')::BIGINT AS items_consumed,
    RANK() OVER (ORDER BY COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status='consumed'),0) DESC)::BIGINT AS rank
  FROM public.pantry_items p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.created_at >= v_start
  GROUP BY p.user_id, u.email
  HAVING COUNT(*) FILTER (WHERE p.status IN ('consumed','tossed')) > 0
  ORDER BY kg_saved DESC
  LIMIT 50;
END;
$$;

-- Seed achievements
INSERT INTO public.achievements (key, name, description, icon, tier, xp_reward, criteria, sort_order) VALUES
('first_save', 'First Bite Saved', 'Consume your first pantry item', 'Sprout', 'bronze', 50, '{"type":"items_consumed","value":1}', 1),
('items_10', 'Pantry Pro', 'Consume 10 items', 'Apple', 'bronze', 100, '{"type":"items_consumed","value":10}', 2),
('items_50', 'Kitchen Hero', 'Consume 50 items', 'ChefHat', 'silver', 250, '{"type":"items_consumed","value":50}', 3),
('items_200', 'Pantry Legend', 'Consume 200 items', 'Crown', 'gold', 500, '{"type":"items_consumed","value":200}', 4),
('kg_1', 'First Kilogram', 'Save 1 kg of food', 'Leaf', 'bronze', 75, '{"type":"kg_saved","value":1}', 10),
('kg_10', 'Eco Saver', 'Save 10 kg of food', 'TreePine', 'silver', 200, '{"type":"kg_saved","value":10}', 11),
('kg_50', 'Planet Protector', 'Save 50 kg of food', 'Globe', 'gold', 500, '{"type":"kg_saved","value":50}', 12),
('kg_100', 'Sustainability Master', 'Save 100 kg of food', 'Trophy', 'platinum', 1000, '{"type":"kg_saved","value":100}', 13),
('streak_3', 'Getting Started', '3-day saving streak', 'Flame', 'bronze', 75, '{"type":"streak","value":3}', 20),
('streak_7', 'Week Warrior', '7-day saving streak', 'Flame', 'silver', 200, '{"type":"streak","value":7}', 21),
('streak_30', 'Month Master', '30-day saving streak', 'Flame', 'gold', 750, '{"type":"streak","value":30}', 22),
('rate_80', 'Waste Watcher', 'Maintain 80% save rate (5+ items)', 'Target', 'silver', 250, '{"type":"save_rate","value":80}', 30),
('rate_95', 'Zero Waste Wonder', '95% save rate (5+ items)', 'Award', 'gold', 600, '{"type":"save_rate","value":95}', 31),
('level_5', 'Rising Star', 'Reach level 5', 'Star', 'silver', 150, '{"type":"level","value":5}', 40),
('level_10', 'Eco Veteran', 'Reach level 10', 'Star', 'gold', 400, '{"type":"level","value":10}', 41),
('variety_15', 'Diverse Diner', '15 different items in your pantry', 'Sparkles', 'silver', 200, '{"type":"distinct_items","value":15}', 50);

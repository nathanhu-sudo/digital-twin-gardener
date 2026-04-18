-- Catalog of weekly challenges
CREATE TABLE public.challenge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  type text NOT NULL, -- 'kg_saved' | 'items_consumed' | 'zero_waste' | 'new_items'
  target numeric NOT NULL,
  xp_reward integer NOT NULL DEFAULT 100,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges readable by all authenticated"
  ON public.challenge_definitions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Only admins manage challenges"
  ON public.challenge_definitions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Per-user week streak tracking + bonus claim ledger
CREATE TABLE public.user_challenge_streaks (
  user_id uuid PRIMARY KEY,
  week_streak integer NOT NULL DEFAULT 0,
  last_completed_week date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_challenge_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own challenge streak"
  ON public.user_challenge_streaks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users upsert own challenge streak"
  ON public.user_challenge_streaks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own challenge streak"
  ON public.user_challenge_streaks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- Track XP bonuses already claimed per week so we never double-award
CREATE TABLE public.user_challenge_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  xp_awarded integer NOT NULL,
  bonus_xp integer NOT NULL,
  week_streak integer NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

ALTER TABLE public.user_challenge_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bonuses"
  ON public.user_challenge_bonuses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own bonuses"
  ON public.user_challenge_bonuses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seed default challenges
INSERT INTO public.challenge_definitions (key, name, description, icon, type, target, xp_reward, sort_order) VALUES
  ('save_2kg',        'Kilogram Crusher',  'Save 2kg of food this week',          'Leaf',     'kg_saved',       2,   100, 1),
  ('consume_5',       'Pantry Power-Up',   'Consume 5 items this week',           'Apple',    'items_consumed', 5,   100, 2),
  ('zero_waste',      'Zero Waste Hero',   'Toss nothing for the whole week',     'Shield',   'zero_waste',     0,   200, 3),
  ('try_3_new',       'Adventurous Eater', 'Add 3 brand-new items this week',     'Sparkles', 'new_items',      3,   150, 4);

-- Returns weekly challenge progress for a user
CREATE OR REPLACE FUNCTION public.get_weekly_challenges(_user_id uuid)
RETURNS TABLE (
  key text,
  name text,
  description text,
  icon text,
  type text,
  target numeric,
  progress numeric,
  completed boolean,
  xp_reward integer,
  sort_order integer,
  week_start date,
  week_end date,
  all_completed boolean,
  bonus_xp integer,
  week_streak integer,
  bonus_claimed boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_week_start date := DATE_TRUNC('week', now())::date;
  v_week_end   date := (DATE_TRUNC('week', now()) + INTERVAL '6 days')::date;
  v_streak     integer := 0;
  v_bonus      integer := 0;
  v_all_done   boolean := true;
  v_claimed    boolean := false;
BEGIN
  SELECT COALESCE(week_streak, 0) INTO v_streak
  FROM public.user_challenge_streaks WHERE user_id = _user_id;
  IF v_streak IS NULL THEN v_streak := 0; END IF;

  -- Bonus scales with current streak (next-week's potential)
  v_bonus := 50 + (v_streak * 25);

  v_claimed := EXISTS (
    SELECT 1 FROM public.user_challenge_bonuses
    WHERE user_id = _user_id AND week_start = v_week_start
  );

  RETURN QUERY
  WITH base AS (
    SELECT cd.*,
      CASE cd.type
        WHEN 'kg_saved' THEN
          COALESCE((SELECT SUM(weight_kg) FROM public.pantry_items
                    WHERE user_id = _user_id AND status='consumed'
                      AND created_at >= v_week_start
                      AND created_at <  v_week_end + INTERVAL '1 day'), 0)
        WHEN 'items_consumed' THEN
          COALESCE((SELECT COUNT(*) FROM public.pantry_items
                    WHERE user_id = _user_id AND status='consumed'
                      AND created_at >= v_week_start
                      AND created_at <  v_week_end + INTERVAL '1 day'), 0)
        WHEN 'zero_waste' THEN
          -- Progress = days passed this week with no toss; target = 7
          (SELECT COUNT(DISTINCT d) FROM generate_series(v_week_start, LEAST(v_week_end, CURRENT_DATE), '1 day'::interval) d
            WHERE NOT EXISTS (
              SELECT 1 FROM public.pantry_items
              WHERE user_id = _user_id AND status='tossed'
                AND DATE(created_at) = d::date
            ))
        WHEN 'new_items' THEN
          (SELECT COUNT(*) FROM (
            SELECT DISTINCT LOWER(name) AS n FROM public.pantry_items
            WHERE user_id = _user_id
              AND created_at >= v_week_start
              AND created_at <  v_week_end + INTERVAL '1 day'
              AND LOWER(name) NOT IN (
                SELECT DISTINCT LOWER(name) FROM public.pantry_items
                WHERE user_id = _user_id AND created_at < v_week_start
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
$$;

-- Claim the weekly bonus (idempotent per week)
CREATE OR REPLACE FUNCTION public.claim_weekly_bonus(_user_id uuid)
RETURNS TABLE (awarded boolean, bonus_xp integer, week_streak integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_week_start date := DATE_TRUNC('week', now())::date;
  v_prev_week  date := v_week_start - INTERVAL '7 days';
  v_all_done   boolean;
  v_existing   uuid;
  v_streak     integer := 0;
  v_last       date;
  v_bonus      integer;
BEGIN
  IF auth.uid() <> _user_id THEN
    RETURN QUERY SELECT false, 0, 0, 'Not authorized'::text;
    RETURN;
  END IF;

  SELECT bool_and(completed) INTO v_all_done
  FROM public.get_weekly_challenges(_user_id);

  IF NOT COALESCE(v_all_done, false) THEN
    RETURN QUERY SELECT false, 0, 0, 'Complete all challenges first'::text;
    RETURN;
  END IF;

  SELECT id INTO v_existing FROM public.user_challenge_bonuses
   WHERE user_id = _user_id AND week_start = v_week_start;
  IF v_existing IS NOT NULL THEN
    RETURN QUERY SELECT false, 0, 0, 'Already claimed this week'::text;
    RETURN;
  END IF;

  SELECT week_streak, last_completed_week INTO v_streak, v_last
  FROM public.user_challenge_streaks WHERE user_id = _user_id;
  IF v_streak IS NULL THEN v_streak := 0; END IF;

  -- Continue or restart streak
  IF v_last = v_prev_week THEN
    v_streak := v_streak + 1;
  ELSE
    v_streak := 1;
  END IF;

  v_bonus := 50 + ((v_streak - 1) * 25);

  INSERT INTO public.user_challenge_streaks (user_id, week_streak, last_completed_week, updated_at)
  VALUES (_user_id, v_streak, v_week_start, now())
  ON CONFLICT (user_id) DO UPDATE
    SET week_streak = EXCLUDED.week_streak,
        last_completed_week = EXCLUDED.last_completed_week,
        updated_at = now();

  INSERT INTO public.user_challenge_bonuses (user_id, week_start, xp_awarded, bonus_xp, week_streak)
  VALUES (_user_id, v_week_start, v_bonus, v_bonus, v_streak);

  -- Add bonus XP into user_stats (persisted; recompute_user_stats will preserve via GREATEST? no — XP is recomputed.
  -- So we store the bonus separately by bumping XP and persisting through user_stats but recompute overwrites.
  -- Simpler: track lifetime bonus XP on user_stats via a dedicated column.
  UPDATE public.user_stats
     SET xp = xp + v_bonus,
         level = 1 + FLOOR((xp + v_bonus) / 250.0)::INT,
         updated_at = now()
   WHERE user_id = _user_id;

  RETURN QUERY SELECT true, v_bonus, v_streak, 'Bonus awarded!'::text;
END;
$$;

-- Make sure recompute_user_stats preserves earned challenge bonuses
CREATE OR REPLACE FUNCTION public.recompute_user_stats(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  in_app_enabled boolean NOT NULL DEFAULT true,
  email_enabled boolean NOT NULL DEFAULT true,
  days_before integer NOT NULL DEFAULT 3 CHECK (days_before BETWEEN 1 AND 14),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notification prefs" ON public.notification_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notification prefs" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notification prefs" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.pantry_items(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'expiry',
  title text NOT NULL,
  body text NOT NULL,
  days_left integer,
  notify_date date NOT NULL DEFAULT CURRENT_DATE,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX notifications_dedup_idx
  ON public.notifications (user_id, item_id, notify_date, type)
  WHERE item_id IS NOT NULL;
CREATE INDEX notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.sync_expiry_notifications(_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_days integer;
  v_enabled boolean;
  v_count integer := 0;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT np.days_before, np.in_app_enabled INTO v_days, v_enabled
  FROM public.notification_preferences np WHERE np.user_id = _user_id;

  IF v_days IS NULL THEN
    INSERT INTO public.notification_preferences (user_id) VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    v_days := 3;
    v_enabled := true;
  END IF;

  IF NOT COALESCE(v_enabled, true) THEN
    RETURN 0;
  END IF;

  WITH candidates AS (
    SELECT pi.id,
           pi.name,
           (DATE(pi.added_at) + pi.shelf_life_days) - CURRENT_DATE AS days_left
    FROM public.pantry_items pi
    WHERE pi.user_id = _user_id
      AND pi.status = 'active'
  ), ins AS (
    INSERT INTO public.notifications (user_id, item_id, type, title, body, days_left)
    SELECT _user_id, c.id, 'expiry',
      CASE
        WHEN c.days_left < 0 THEN c.name || ' has expired'
        WHEN c.days_left = 0 THEN c.name || ' expires today'
        WHEN c.days_left = 1 THEN c.name || ' expires tomorrow'
        ELSE c.name || ' expires in ' || c.days_left || ' days'
      END,
      CASE
        WHEN c.days_left < 0 THEN 'This item is past its shelf life — check it before using or toss it to keep your stats accurate.'
        WHEN c.days_left = 0 THEN 'Use it today to keep it out of the bin and earn your saved-kg.'
        ELSE 'Plan a meal around it soon so it does not go to waste.'
      END,
      c.days_left
    FROM candidates c
    WHERE c.days_left <= v_days
    ON CONFLICT DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM ins;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_expiry_notifications(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_expiry_notifications(uuid) TO authenticated;
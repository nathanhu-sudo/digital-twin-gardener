
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friendships_status_chk CHECK (status IN ('pending','accepted')),
  CONSTRAINT friendships_no_self CHECK (requester_id <> addressee_id),
  CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own friendships" ON public.friendships
  FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users send friend requests" ON public.friendships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id AND status = 'pending');

CREATE POLICY "Addressee responds to requests" ON public.friendships
  FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = addressee_id);

CREATE POLICY "Either party removes friendship" ON public.friendships
  FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE TRIGGER friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX friendships_addressee_idx ON public.friendships(addressee_id, status);
CREATE INDEX friendships_requester_idx ON public.friendships(requester_id, status);

-- Friend list with request state
CREATE OR REPLACE FUNCTION public.get_friends()
RETURNS TABLE(friendship_id uuid, user_id uuid, display_name text, avatar_url text, status text, direction text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT f.id,
         CASE WHEN f.requester_id = auth.uid() THEN f.addressee_id ELSE f.requester_id END,
         COALESCE(NULLIF(TRIM(p.display_name), ''), 'Anonymous')::text,
         p.avatar_url,
         f.status,
         CASE WHEN f.requester_id = auth.uid() THEN 'outgoing' ELSE 'incoming' END,
         f.created_at
  FROM public.friendships f
  LEFT JOIN public.profiles p
    ON p.id = CASE WHEN f.requester_id = auth.uid() THEN f.addressee_id ELSE f.requester_id END
  WHERE auth.uid() IS NOT NULL
    AND (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
  ORDER BY f.status, f.created_at DESC;
$$;

-- Safe member search (name + avatar only)
CREATE OR REPLACE FUNCTION public.search_members(_q text)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, relation text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id,
         COALESCE(NULLIF(TRIM(p.display_name), ''), 'Anonymous')::text,
         p.avatar_url,
         COALESCE((
           SELECT CASE WHEN f.status = 'accepted' THEN 'friend'
                       WHEN f.requester_id = auth.uid() THEN 'outgoing'
                       ELSE 'incoming' END
           FROM public.friendships f
           WHERE (f.requester_id = auth.uid() AND f.addressee_id = p.id)
              OR (f.addressee_id = auth.uid() AND f.requester_id = p.id)
           LIMIT 1
         ), 'none')::text
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND LENGTH(TRIM(COALESCE(_q,''))) >= 2
    AND p.display_name ILIKE '%' || TRIM(_q) || '%'
  ORDER BY p.display_name
  LIMIT 20;
$$;

-- Leaderboard with avatars + optional friends-only filter
DROP FUNCTION IF EXISTS public.get_leaderboard(text);

CREATE OR REPLACE FUNCTION public.get_leaderboard(_period text, _friends_only boolean DEFAULT false)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, kg_saved numeric, items_consumed bigint, rank bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_start timestamptz;
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
    COALESCE(NULLIF(TRIM(pr.display_name), ''), 'Anonymous')::text,
    pr.avatar_url,
    COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status='consumed'), 0)::numeric,
    COUNT(*) FILTER (WHERE p.status='consumed')::bigint,
    RANK() OVER (ORDER BY COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status='consumed'),0) DESC)::bigint
  FROM public.pantry_items p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.created_at >= v_start
    AND (
      NOT _friends_only
      OR p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.status = 'accepted'
          AND ((f.requester_id = auth.uid() AND f.addressee_id = p.user_id)
            OR (f.addressee_id = auth.uid() AND f.requester_id = p.user_id))
      )
    )
  GROUP BY p.user_id, pr.display_name, pr.avatar_url
  HAVING COUNT(*) FILTER (WHERE p.status IN ('consumed','tossed')) > 0
  ORDER BY 4 DESC
  LIMIT 50;
END;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_friends() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.search_members(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friends() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_members(text) TO authenticated;

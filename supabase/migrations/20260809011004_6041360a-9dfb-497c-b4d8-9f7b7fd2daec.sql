
-- Ensure friend-related definer functions have explicit auth guards
CREATE OR REPLACE FUNCTION public.get_friends()
 RETURNS TABLE(friendship_id uuid, user_id uuid, display_name text, avatar_url text, status text, direction text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
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
  WHERE (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
  ORDER BY f.status, f.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.search_members(_q text)
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, relation text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
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
  WHERE p.id <> auth.uid()
    AND LENGTH(TRIM(COALESCE(_q,''))) >= 2
    AND p.display_name ILIKE '%' || TRIM(_q) || '%'
  ORDER BY p.display_name
  LIMIT 20;
END;
$function$;

-- Internal-only helpers: not directly callable by clients
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_user_stats(uuid) FROM PUBLIC, anon, authenticated;

-- User-facing definer RPCs: authenticated only, never anon/public
REVOKE ALL ON FUNCTION public.get_friends() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.search_members(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_leaderboard(text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_community_impact() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_weekly_challenges(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_weekly_bonus(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.check_and_unlock_achievements(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_admin_users_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_friends() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_members(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_impact() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_challenges(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_weekly_bonus(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- 1. Profiles: owner-only SELECT
DROP POLICY IF EXISTS "Profiles viewable by everyone authenticated" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- 2. Remove self-write policies on gamification tables
DROP POLICY IF EXISTS "Users insert own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users insert own bonuses" ON public.user_challenge_bonuses;
DROP POLICY IF EXISTS "Users upsert own challenge streak" ON public.user_challenge_streaks;
DROP POLICY IF EXISTS "Users update own challenge streak" ON public.user_challenge_streaks;
DROP POLICY IF EXISTS "Users update own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users upsert own stats" ON public.user_stats;

-- 3. Lock down SECURITY DEFINER functions: revoke from public/anon/authenticated,
-- then grant execute only to what the client legitimately needs.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_user_stats(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_and_unlock_achievements(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_weekly_bonus(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_weekly_challenges(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_leaderboard(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_community_impact() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_admin_users_overview() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_weekly_bonus(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_challenges(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_impact() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users_overview() TO authenticated;

-- 4. Storage: remove broad listing on avatars bucket. Files remain reachable via
-- their public URL because the bucket itself is public.
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;

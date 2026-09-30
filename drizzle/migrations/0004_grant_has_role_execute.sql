-- RLS policies for authenticated users call public.has_role, but EXECUTE was revoked,
-- causing "permission denied for function has_role" for ordinary signed-in users.
-- has_role is a safe read-only check (returns whether a user has a role), so granting
-- EXECUTE to authenticated and anon restores those policies without weakening security.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
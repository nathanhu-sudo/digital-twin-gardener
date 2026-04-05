
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can read community impact" ON public.pantry_items;

-- Drop the security definer view
DROP VIEW IF EXISTS public.community_impact;

-- Create a security definer function to return aggregate stats
CREATE OR REPLACE FUNCTION public.get_community_impact()
RETURNS TABLE (
  total_users bigint,
  total_items bigint,
  total_saved_kg numeric,
  total_wasted_kg numeric,
  total_co2_saved_kg numeric,
  total_co2_wasted_kg numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(DISTINCT user_id) AS total_users,
    COUNT(*) AS total_items,
    COALESCE(SUM(CASE WHEN status = 'consumed' THEN weight_kg ELSE 0 END), 0) AS total_saved_kg,
    COALESCE(SUM(CASE WHEN status = 'tossed' THEN weight_kg ELSE 0 END), 0) AS total_wasted_kg,
    COALESCE(SUM(CASE WHEN status = 'consumed' THEN
      weight_kg * CASE co2_impact WHEN 'high' THEN 27.0 WHEN 'medium' THEN 3.2 WHEN 'low' THEN 0.9 ELSE 0 END
    ELSE 0 END), 0) AS total_co2_saved_kg,
    COALESCE(SUM(CASE WHEN status = 'tossed' THEN
      weight_kg * CASE co2_impact WHEN 'high' THEN 27.0 WHEN 'medium' THEN 3.2 WHEN 'low' THEN 0.9 ELSE 0 END
    ELSE 0 END), 0) AS total_co2_wasted_kg
  FROM public.pantry_items;
$$;

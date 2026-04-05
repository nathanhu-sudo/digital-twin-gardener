
-- Create a view for aggregate community impact
CREATE OR REPLACE VIEW public.community_impact AS
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

-- Allow authenticated users to read the aggregate view
CREATE POLICY "Authenticated users can read community impact"
ON public.pantry_items
FOR SELECT
TO authenticated
USING (true);

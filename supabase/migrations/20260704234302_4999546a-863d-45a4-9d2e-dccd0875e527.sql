CREATE OR REPLACE FUNCTION public.get_leaderboard(_period text)
 RETURNS TABLE(user_id uuid, display_name text, kg_saved numeric, items_consumed bigint, rank bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_start TIMESTAMPTZ;
BEGIN
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
    COALESCE(NULLIF(TRIM(pr.display_name), ''), 'Anonymous')::TEXT AS display_name,
    COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status='consumed'), 0)::NUMERIC AS kg_saved,
    COUNT(*) FILTER (WHERE p.status='consumed')::BIGINT AS items_consumed,
    RANK() OVER (ORDER BY COALESCE(SUM(p.weight_kg) FILTER (WHERE p.status='consumed'),0) DESC)::BIGINT AS rank
  FROM public.pantry_items p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.created_at >= v_start
  GROUP BY p.user_id, pr.display_name
  HAVING COUNT(*) FILTER (WHERE p.status IN ('consumed','tossed')) > 0
  ORDER BY kg_saved DESC
  LIMIT 50;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_leaderboard(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;
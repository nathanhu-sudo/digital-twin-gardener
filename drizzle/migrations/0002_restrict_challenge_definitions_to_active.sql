DROP POLICY IF EXISTS "Challenges readable by all authenticated" ON public.challenge_definitions;

CREATE POLICY "Active challenges readable by authenticated"
ON public.challenge_definitions
FOR SELECT
TO authenticated
USING (active = true);
DROP POLICY IF EXISTS "Tags readable by authenticated" ON public.user_tags;
CREATE POLICY "Users view own tags or admins" ON public.user_tags
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
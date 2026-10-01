ALTER TABLE public.pantry_items ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_pantry_status_changed_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_pantry_status_changed_at ON public.pantry_items;
CREATE TRIGGER trg_pantry_status_changed_at BEFORE UPDATE ON public.pantry_items
FOR EACH ROW EXECUTE FUNCTION public.set_pantry_status_changed_at();

CREATE TABLE public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  plan_date date NOT NULL,
  meal text NOT NULL DEFAULT 'dinner' CHECK (meal IN ('breakfast','lunch','dinner')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plans TO authenticated;
GRANT ALL ON public.meal_plans TO service_role;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or household meals" ON public.meal_plans FOR SELECT TO authenticated
USING (user_id = auth.uid() OR (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid())));
CREATE POLICY "Insert own meals" ON public.meal_plans FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND (household_id IS NULL OR public.is_household_member(household_id, auth.uid())));
CREATE POLICY "Update own or household meals" ON public.meal_plans FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid())))
WITH CHECK (user_id = auth.uid() OR (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid())));
CREATE POLICY "Delete own or household meals" ON public.meal_plans FOR DELETE TO authenticated
USING (user_id = auth.uid() OR (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid())));

CREATE INDEX meal_plans_date_idx ON public.meal_plans (plan_date);
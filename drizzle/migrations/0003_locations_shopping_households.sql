ALTER TABLE public.pantry_items ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT 'fridge' CHECK (location IN ('fridge','freezer','pantry'));
ALTER TABLE public.pantry_items ADD COLUMN IF NOT EXISTS household_id uuid;

CREATE TABLE public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Our kitchen',
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text),1,8)),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.households TO authenticated;
GRANT ALL ON public.households TO service_role;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.household_members (
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, user_id),
  UNIQUE (user_id)
);
GRANT SELECT, DELETE ON public.household_members TO authenticated;
GRANT ALL ON public.household_members TO service_role;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_household_member(_hid uuid, _uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _hid IS NOT NULL AND EXISTS (SELECT 1 FROM public.household_members WHERE household_id=_hid AND user_id=_uid)
$$;

CREATE POLICY "Members view household" ON public.households FOR SELECT TO authenticated USING (public.is_household_member(id, auth.uid()));
CREATE POLICY "Owner updates household" ON public.households FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner deletes household" ON public.households FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Members view members" ON public.household_members FOR SELECT TO authenticated USING (public.is_household_member(household_id, auth.uid()));
CREATE POLICY "Members leave" ON public.household_members FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.create_household(_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE hid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM household_members WHERE user_id=auth.uid()) THEN RAISE EXCEPTION 'Already in a household'; END IF;
  INSERT INTO households(name, owner_id) VALUES (coalesce(nullif(trim(left(_name,60)),''),'Our kitchen'), auth.uid()) RETURNING id INTO hid;
  INSERT INTO household_members(household_id,user_id) VALUES (hid, auth.uid());
  UPDATE pantry_items SET household_id = hid WHERE user_id = auth.uid() AND status='active';
  RETURN hid;
END $$;

CREATE OR REPLACE FUNCTION public.join_household(_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE hid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT id INTO hid FROM households WHERE invite_code = upper(trim(_code));
  IF hid IS NULL THEN RAISE EXCEPTION 'Invalid invite code'; END IF;
  DELETE FROM household_members WHERE user_id = auth.uid();
  INSERT INTO household_members(household_id,user_id) VALUES (hid, auth.uid());
  UPDATE pantry_items SET household_id = hid WHERE user_id = auth.uid() AND status='active';
  RETURN hid;
END $$;

CREATE OR REPLACE FUNCTION public.leave_household()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE pantry_items SET household_id = NULL WHERE user_id = auth.uid();
  DELETE FROM household_members WHERE user_id = auth.uid();
END $$;
REVOKE EXECUTE ON FUNCTION public.create_household(text), public.join_household(text), public.leave_household() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_household(text), public.join_household(text), public.leave_household() TO authenticated;

DROP POLICY "Users can view own items" ON public.pantry_items;
DROP POLICY "Users can update own items" ON public.pantry_items;
CREATE POLICY "Users view own or household items" ON public.pantry_items FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_household_member(household_id, auth.uid()));
CREATE POLICY "Users update own or household items" ON public.pantry_items FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_household_member(household_id, auth.uid()));

CREATE TABLE public.shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  checked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_list_items TO authenticated;
GRANT ALL ON public.shopping_list_items TO service_role;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own or household list" ON public.shopping_list_items FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.is_household_member(household_id, auth.uid()));
CREATE POLICY "Insert own list" ON public.shopping_list_items FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id AND (household_id IS NULL OR public.is_household_member(household_id, auth.uid())));
CREATE POLICY "Update own or household list" ON public.shopping_list_items FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.is_household_member(household_id, auth.uid()));
CREATE POLICY "Delete own or household list" ON public.shopping_list_items FOR DELETE TO authenticated USING (auth.uid()=user_id OR public.is_household_member(household_id, auth.uid()));
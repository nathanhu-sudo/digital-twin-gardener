CREATE TABLE public.user_subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  is_lifetime boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_subscriptions_plan_check CHECK (plan IN ('free','lite','pro','lifetime')),
  CONSTRAINT user_subscriptions_status_check CHECK (status IN ('active','canceled','past_due'))
);

GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription"
ON public.user_subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_my_plan(_plan text, _billing text DEFAULT 'monthly')
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.user_subscriptions;
  _expires timestamptz;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _plan NOT IN ('free','lite','pro','lifetime') THEN
    RAISE EXCEPTION 'Invalid plan';
  END IF;

  IF _plan = 'free' OR _plan = 'lifetime' THEN
    _expires := NULL;
  ELSIF _billing = 'yearly' THEN
    _expires := now() + interval '1 year';
  ELSE
    _expires := now() + interval '1 month';
  END IF;

  INSERT INTO public.user_subscriptions (user_id, plan, status, is_lifetime, started_at, expires_at, updated_at)
  VALUES (_uid, _plan, 'active', _plan = 'lifetime', now(), _expires, now())
  ON CONFLICT (user_id) DO UPDATE
    SET plan = EXCLUDED.plan,
        status = 'active',
        is_lifetime = EXCLUDED.is_lifetime,
        started_at = now(),
        expires_at = EXCLUDED.expires_at,
        updated_at = now()
  RETURNING * INTO _row;

  RETURN _row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_my_plan(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_my_plan(text, text) TO authenticated;
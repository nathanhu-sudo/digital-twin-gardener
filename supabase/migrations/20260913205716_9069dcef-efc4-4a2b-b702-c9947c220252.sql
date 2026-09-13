ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS paddle_subscription_id text,
  ADD COLUMN IF NOT EXISTS paddle_customer_id text,
  ADD COLUMN IF NOT EXISTS paddle_transaction_id text,
  ADD COLUMN IF NOT EXISTS environment text;

CREATE OR REPLACE FUNCTION public.set_my_plan(_plan text, _billing text DEFAULT 'monthly'::text)
RETURNS user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _row public.user_subscriptions;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _plan <> 'free' THEN
    RAISE EXCEPTION 'Paid plans can only be activated through checkout';
  END IF;

  INSERT INTO public.user_subscriptions (user_id, plan, status, is_lifetime, started_at, expires_at, updated_at)
  VALUES (_uid, 'free', 'active', false, now(), NULL, now())
  ON CONFLICT (user_id) DO UPDATE
    SET plan = 'free',
        status = 'active',
        is_lifetime = false,
        expires_at = NULL,
        updated_at = now()
  RETURNING * INTO _row;

  RETURN _row;
END;
$function$;

CREATE OR REPLACE FUNCTION public.apply_paid_plan(
  _user_id uuid,
  _plan text,
  _status text,
  _expires timestamptz,
  _paddle_subscription_id text,
  _paddle_customer_id text,
  _paddle_transaction_id text,
  _environment text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF _plan NOT IN ('free','lite','pro','lifetime') THEN
    RAISE EXCEPTION 'Invalid plan';
  END IF;

  INSERT INTO public.user_subscriptions (
    user_id, plan, status, is_lifetime, started_at, expires_at, updated_at,
    paddle_subscription_id, paddle_customer_id, paddle_transaction_id, environment
  ) VALUES (
    _user_id, _plan, _status, _plan = 'lifetime', now(),
    CASE WHEN _plan = 'lifetime' THEN NULL ELSE _expires END, now(),
    _paddle_subscription_id, _paddle_customer_id, _paddle_transaction_id, _environment
  )
  ON CONFLICT (user_id) DO UPDATE
    SET plan = EXCLUDED.plan,
        status = EXCLUDED.status,
        is_lifetime = EXCLUDED.is_lifetime,
        expires_at = EXCLUDED.expires_at,
        updated_at = now(),
        paddle_subscription_id = COALESCE(EXCLUDED.paddle_subscription_id, public.user_subscriptions.paddle_subscription_id),
        paddle_customer_id = COALESCE(EXCLUDED.paddle_customer_id, public.user_subscriptions.paddle_customer_id),
        paddle_transaction_id = COALESCE(EXCLUDED.paddle_transaction_id, public.user_subscriptions.paddle_transaction_id),
        environment = EXCLUDED.environment
  WHERE public.user_subscriptions.is_lifetime IS NOT TRUE;
END;
$function$;

REVOKE ALL ON FUNCTION public.apply_paid_plan(uuid, text, text, timestamptz, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_paid_plan(uuid, text, text, timestamptz, text, text, text, text) TO service_role;
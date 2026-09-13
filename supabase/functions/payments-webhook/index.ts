import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }
  return _supabase;
}

const PRICE_PLAN: Record<string, 'lite' | 'pro' | 'lifetime'> = {
  lite_monthly: 'lite',
  lite_yearly: 'lite',
  pro_monthly: 'pro',
  pro_yearly: 'pro',
  lifetime_onetime: 'lifetime',
};

function externalPriceId(data: any): string | undefined {
  return data?.items?.[0]?.price?.importMeta?.externalId;
}

async function applyPlan(args: {
  userId: string;
  plan: string;
  status: string;
  expires: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  transactionId?: string | null;
  env: PaddleEnv;
}) {
  const { error } = await getSupabase().rpc('apply_paid_plan', {
    _user_id: args.userId,
    _plan: args.plan,
    _status: args.status,
    _expires: args.expires,
    _paddle_subscription_id: args.subscriptionId ?? null,
    _paddle_customer_id: args.customerId ?? null,
    _paddle_transaction_id: args.transactionId ?? null,
    _environment: args.env,
  });
  if (error) console.error('apply_paid_plan failed', error);
}

async function userIdForSubscription(subscriptionId: string): Promise<string | null> {
  const { data } = await getSupabase()
    .from('user_subscriptions')
    .select('user_id')
    .eq('paddle_subscription_id', subscriptionId)
    .maybeSingle();
  return (data?.user_id as string) ?? null;
}

async function handleSubscription(data: any, env: PaddleEnv, canceled = false) {
  const userId = data?.customData?.userId ?? (await userIdForSubscription(data?.id));
  if (!userId) {
    console.warn('No userId for subscription', data?.id);
    return;
  }

  if (canceled) {
    await applyPlan({
      userId,
      plan: 'free',
      status: 'canceled',
      expires: null,
      subscriptionId: data?.id,
      customerId: data?.customerId,
      env,
    });
    return;
  }

  const priceId = externalPriceId(data);
  const plan = priceId ? PRICE_PLAN[priceId] : undefined;
  if (!plan) {
    console.warn('Unknown price on subscription', priceId);
    return;
  }

  const active = data?.status === 'active' || data?.status === 'trialing';
  await applyPlan({
    userId,
    plan: active ? plan : 'free',
    status: active ? 'active' : String(data?.status ?? 'inactive'),
    expires: data?.currentBillingPeriod?.endsAt ?? null,
    subscriptionId: data?.id,
    customerId: data?.customerId,
    env,
  });
}

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  // One-off purchases only; subscription renewals are handled by subscription events.
  if (data?.subscriptionId) return;
  const userId = data?.customData?.userId;
  const priceId = externalPriceId(data);
  if (!userId || priceId !== 'lifetime_onetime') return;

  await applyPlan({
    userId,
    plan: 'lifetime',
    status: 'active',
    expires: null,
    customerId: data?.customerId,
    transactionId: data?.id,
    env,
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
  try {
    const event = await verifyWebhook(req, env);
    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await handleSubscription(event.data, env);
        break;
      case EventName.SubscriptionCanceled:
        await handleSubscription(event.data, env, true);
        break;
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(event.data, env);
        break;
      default:
        console.log('Unhandled event:', event.eventType);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});

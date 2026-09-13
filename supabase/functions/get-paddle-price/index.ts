import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';

const ALLOWED_PRICES = new Set([
  'lite_monthly',
  'lite_yearly',
  'pro_monthly',
  'pro_yearly',
  'lifetime_onetime',
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, environment } = await req.json();
    const env: PaddleEnv = environment === 'live' ? 'live' : 'sandbox';

    if (typeof priceId !== 'string' || !ALLOWED_PRICES.has(priceId)) {
      return new Response(JSON.stringify({ error: 'Unknown price' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await gatewayFetch(
      env,
      `/prices?external_id=${encodeURIComponent(priceId)}`,
    );
    const data = await response.json();
    const paddleId = data?.data?.[0]?.id;

    if (!paddleId) {
      return new Response(JSON.stringify({ error: 'Price not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ paddleId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('get-paddle-price error', e);
    return new Response(JSON.stringify({ error: 'Failed to resolve price' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

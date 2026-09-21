import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const VPN_HINTS = [
  "vpn", "proxy", "hosting", "datacenter", "data center", "cloud", "server",
  "digitalocean", "linode", "ovh", "hetzner", "amazon", "google llc", "microsoft",
  "m247", "choopa", "vultr", "leaseweb", "nordvpn", "expressvpn", "mullvad", "privado",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "");

    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    let browserTimezone: string | null = null;
    try {
      const body = await req.json();
      if (typeof body?.timezone === "string" && body.timezone.length < 64) {
        browserTimezone = body.timezone;
      }
    } catch (_) { /* no body */ }

    const fwd = req.headers.get("x-forwarded-for") ?? "";
    const ip = fwd.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "";

    let geo: Record<string, unknown> = {};
    if (ip && !ip.startsWith("127.") && !ip.startsWith("10.") && !ip.startsWith("192.168.")) {
      try {
        const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
          headers: { "User-Agent": "SmartPantryAI/1.0" },
        });
        if (res.ok) geo = await res.json();
      } catch (_) { /* lookup failed */ }
    }

    const country = (geo.country_name as string) ?? null;
    const countryCode = (geo.country_code as string) ?? null;
    const region = (geo.region as string) ?? null;
    const city = (geo.city as string) ?? null;
    const ipTimezone = (geo.timezone as string) ?? null;
    const org = ((geo.org as string) ?? (geo.asn as string)) ?? null;

    const reasons: string[] = [];
    if (org && VPN_HINTS.some((h) => org.toLowerCase().includes(h))) {
      reasons.push("Network belongs to a hosting/VPN provider");
    }
    if (browserTimezone && ipTimezone && browserTimezone !== ipTimezone) {
      reasons.push(`Device timezone ${browserTimezone} differs from IP timezone ${ipTimezone}`);
    }
    const vpnSuspected = reasons.length > 0;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: existing } = await admin
      .from("user_geo")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const latest = {
      last_ip: ip || null,
      last_country: country,
      last_country_code: countryCode,
      last_region: region,
      last_city: city,
      last_timezone: ipTimezone,
      last_org: org,
      last_seen_at: new Date().toISOString(),
      vpn_suspected: vpnSuspected,
      vpn_reason: reasons.join("; ") || null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await admin.from("user_geo").update(latest).eq("user_id", user.id);
    } else {
      await admin.from("user_geo").insert({
        user_id: user.id,
        signup_ip: ip || null,
        signup_country: country,
        signup_country_code: countryCode,
        signup_region: region,
        signup_city: city,
        signup_timezone: ipTimezone,
        signup_org: org,
        ...latest,
      });
    }

    return json({ success: true, country, city, vpn_suspected: vpnSuspected });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});

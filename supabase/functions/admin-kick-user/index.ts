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
    const caller = userData?.user;
    if (userErr || !caller) return json({ error: "Unauthorized" }, 401);

    // Verify admin role server-side (never trust the client)
    const { data: isAdmin, error: roleErr } = await anon.rpc("is_admin");
    if (roleErr || isAdmin !== true) return json({ error: "Forbidden" }, 403);

    const { userId } = await req.json();
    if (!userId || typeof userId !== "string") return json({ error: "userId required" }, 400);
    if (userId === caller.id) return json({ error: "You cannot remove your own account" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Block removing other admins
    const { data: targetRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if ((targetRoles ?? []).some((r: { role: string }) => r.role === "admin")) {
      return json({ error: "Cannot remove another admin" }, 400);
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) return json({ error: delErr.message }, 400);

    return json({ success: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});

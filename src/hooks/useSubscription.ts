import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ITEM_LIMITS, PlanId, planAtLeast } from "@/lib/plans";

export function useSubscription() {
  const [plan, setPlan] = useState<PlanId>("free");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setPlan("free");
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_subscriptions")
      .select("plan, status, expires_at")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    const expired =
      data?.expires_at != null && new Date(data.expires_at).getTime() < Date.now();
    setPlan(!data || data.status !== "active" || expired ? "free" : (data.plan as PlanId));
    setExpiresAt(data?.expires_at ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const changePlan = useCallback(
    async (next: PlanId, billing: "monthly" | "yearly" = "monthly") => {
      const { error } = await supabase.rpc("set_my_plan", { _plan: next, _billing: billing });
      if (error) throw error;
      await refresh();
    },
    [refresh],
  );

  return {
    plan,
    expiresAt,
    loading,
    refresh,
    changePlan,
    itemLimit: ITEM_LIMITS[plan],
    isPaid: planAtLeast(plan, "lite"),
    hasAnalytics: planAtLeast(plan, "lite"),
    hasEmailAlerts: planAtLeast(plan, "lite"),
    hasAI: planAtLeast(plan, "pro"),
    hasSocial: planAtLeast(plan, "pro"),
  };
}

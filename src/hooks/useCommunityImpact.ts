import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityImpact {
  totalUsers: number;
  totalItems: number;
  totalSavedKg: number;
  totalWastedKg: number;
  totalCo2SavedKg: number;
  totalCo2WastedKg: number;
  avgSaveRate: number;
  weeklyTrend: {
    weekStart: string;
    savedKg: number;
    wastedKg: number;
  }[];
  topContributors: {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    kgSaved: number;
    itemsConsumed: number;
    rank: number;
  }[];
  commonItems: {
    name: string;
    count: number;
    totalKg: number;
  }[];
}

export function useCommunityImpact() {
  const [data, setData] = useState<CommunityImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchImpact = useCallback(async () => {
    const [
      { data: impactRows, error: impactError },
      { data: trendRows, error: trendError },
      { data: contributorRows, error: contributorError },
      { data: itemRows, error: itemError },
    ] = await Promise.all([
      supabase.rpc("get_community_impact"),
      supabase.rpc("get_community_weekly_trend"),
      supabase.rpc("get_community_top_contributors"),
      supabase.rpc("get_community_common_items"),
    ]);

    if (impactError || trendError || contributorError || itemError) {
      setLoading(false);
      return;
    }

    if (impactRows && impactRows.length > 0) {
      const r = impactRows[0];
      const totalSaved = Number(r.total_saved_kg);
      const totalWasted = Number(r.total_wasted_kg);
      const totalKg = totalSaved + totalWasted;
      const avgSaveRate =
        r.total_users > 0 && totalKg > 0
          ? Math.round(totalSaved / totalKg * 100)
          : 0;

      setData({
        totalUsers: Number(r.total_users),
        totalItems: Number(r.total_items),
        totalSavedKg: totalSaved,
        totalWastedKg: totalWasted,
        totalCo2SavedKg: Number(r.total_co2_saved_kg),
        totalCo2WastedKg: Number(r.total_co2_wasted_kg),
        avgSaveRate,
        weeklyTrend:
          trendRows?.map((w) => ({
            weekStart: w.week_start,
            savedKg: Number(w.saved_kg),
            wastedKg: Number(w.wasted_kg),
          })) ?? [],
        topContributors:
          contributorRows?.map((c) => ({
            userId: c.user_id,
            displayName: c.display_name,
            avatarUrl: c.avatar_url,
            kgSaved: Number(c.kg_saved),
            itemsConsumed: Number(c.items_consumed),
            rank: Number(c.rank),
          })) ?? [],
        commonItems:
          itemRows?.map((i) => ({
            name: i.name,
            count: Number(i.count),
            totalKg: Number(i.total_kg),
          })) ?? [],
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchImpact();
  }, [fetchImpact]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchImpact();
    setRefreshing(false);
  }, [fetchImpact]);

  return { data, loading, refreshing, refresh };
}

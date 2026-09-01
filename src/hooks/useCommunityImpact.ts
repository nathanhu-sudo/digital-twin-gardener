import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityImpact {
  totalUsers: number;
  totalItems: number;
  totalSavedKg: number;
  totalWastedKg: number;
  totalCo2SavedKg: number;
  totalCo2WastedKg: number;
}

export function useCommunityImpact() {
  const [data, setData] = useState<CommunityImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchImpact = useCallback(async () => {
    const { data: rows, error } = await supabase.rpc("get_community_impact");
    if (!error && rows && rows.length > 0) {
      const r = rows[0];
      setData({
        totalUsers: Number(r.total_users),
        totalItems: Number(r.total_items),
        totalSavedKg: Number(r.total_saved_kg),
        totalWastedKg: Number(r.total_wasted_kg),
        totalCo2SavedKg: Number(r.total_co2_saved_kg),
        totalCo2WastedKg: Number(r.total_co2_wasted_kg),
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


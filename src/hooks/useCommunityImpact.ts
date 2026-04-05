import { useState, useEffect } from "react";
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

  useEffect(() => {
    supabase.rpc("get_community_impact").then(({ data: rows, error }) => {
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
    });
  }, []);

  return { data, loading };
}

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Household = { id: string; name: string; invite_code: string; owner_id: string };

export function useHousehold() {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setHousehold(null); setLoading(false); return; }
    const { data: m } = await supabase
      .from("household_members").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!m) { setHousehold(null); setMemberCount(0); setLoading(false); return; }
    const [{ data: h }, { count }] = await Promise.all([
      supabase.from("households").select("id,name,invite_code,owner_id").eq("id", m.household_id).maybeSingle(),
      supabase.from("household_members").select("user_id", { count: "exact", head: true }).eq("household_id", m.household_id),
    ]);
    setHousehold(h as Household | null);
    setMemberCount(count ?? 1);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (name: string) => {
    const { error } = await supabase.rpc("create_household", { _name: name });
    if (error) throw error;
    await refresh();
  };
  const join = async (code: string) => {
    const { error } = await supabase.rpc("join_household", { _code: code });
    if (error) throw error;
    await refresh();
  };
  const leave = async () => {
    const { error } = await supabase.rpc("leave_household");
    if (error) throw error;
    await refresh();
  };

  return { household, memberCount, loading, refresh, create, join, leave };
}

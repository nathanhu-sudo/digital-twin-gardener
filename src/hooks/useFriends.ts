import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export interface FriendRow {
  friendship_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  status: "pending" | "accepted";
  direction: "incoming" | "outgoing";
  created_at: string;
}

export interface MemberSearchRow {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  relation: "none" | "friend" | "incoming" | "outgoing";
}

export function useFriends() {
  const { user } = useAuth();
  const [rows, setRows] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("get_friends");
    if (!error && data) setRows(data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const search = useCallback(async (q: string): Promise<MemberSearchRow[]> => {
    if (q.trim().length < 2) return [];
    const { data, error } = await supabase.rpc("search_members", { _q: q });
    if (error) return [];
    return (data ?? []) as any;
  }, []);

  const sendRequest = useCallback(
    async (targetId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("friendships")
        .insert({ requester_id: user.id, addressee_id: targetId, status: "pending" });
      if (error) {
        toast.error("Couldn't send request", { description: error.message });
        return;
      }
      toast.success("Friend request sent");
      refresh();
    },
    [user, refresh]
  );

  const accept = useCallback(
    async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
      if (error) {
        toast.error("Couldn't accept request", { description: error.message });
        return;
      }
      toast.success("You're now friends 🎉");
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (friendshipId: string) => {
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
      if (error) {
        toast.error("Couldn't update", { description: error.message });
        return;
      }
      refresh();
    },
    [refresh]
  );

  const friends = rows.filter((r) => r.status === "accepted");
  const incoming = rows.filter((r) => r.status === "pending" && r.direction === "incoming");
  const outgoing = rows.filter((r) => r.status === "pending" && r.direction === "outgoing");

  return { friends, incoming, outgoing, loading, refresh, search, sendRequest, accept, remove };
}

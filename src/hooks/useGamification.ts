import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export interface UserStats {
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  items_consumed: number;
  items_tossed: number;
  kg_saved: number;
  kg_wasted: number;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  xp_reward: number;
  criteria: { type: string; value: number };
  sort_order: number;
}

export interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export interface LeaderboardRow {
  user_id: string;
  email: string;
  kg_saved: number;
  items_consumed: number;
  rank: number;
}

export const XP_PER_LEVEL = 250;

export function levelTitle(level: number): string {
  if (level >= 20) return "Eco Legend";
  if (level >= 15) return "Planet Guardian";
  if (level >= 10) return "Eco Veteran";
  if (level >= 7) return "Green Warrior";
  if (level >= 5) return "Rising Star";
  if (level >= 3) return "Sapling";
  return "Sprout";
}

export function useGamification() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setStats(null);
      setUnlocked([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Trigger compute + unlock; capture newly unlocked
    const { data: newlyUnlocked } = await supabase.rpc("check_and_unlock_achievements", {
      _user_id: user.id,
    });

    if (newlyUnlocked && Array.isArray(newlyUnlocked)) {
      newlyUnlocked.forEach((a: any) => {
        toast.success(`🏆 Achievement unlocked: ${a.name}`, {
          description: `+${a.xp_reward} XP earned`,
        });
      });
    }

    const [statsRes, achRes, unlRes] = await Promise.all([
      supabase.from("user_stats").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("achievements").select("*").order("sort_order"),
      supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", user.id),
    ]);

    if (statsRes.data) {
      setStats({
        xp: statsRes.data.xp,
        level: statsRes.data.level,
        current_streak: statsRes.data.current_streak,
        longest_streak: statsRes.data.longest_streak,
        items_consumed: statsRes.data.items_consumed,
        items_tossed: statsRes.data.items_tossed,
        kg_saved: Number(statsRes.data.kg_saved),
        kg_wasted: Number(statsRes.data.kg_wasted),
      });
    }
    if (achRes.data) setAchievements(achRes.data as any);
    if (unlRes.data) setUnlocked(unlRes.data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, achievements, unlocked, loading, refresh };
}

export function useLeaderboard(period: "week" | "month") {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.rpc("get_leaderboard", { _period: period }).then(({ data, error }) => {
      if (!error && data) setRows(data as any);
      setLoading(false);
    });
  }, [period]);

  return { rows, loading };
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export interface WeeklyChallenge {
  key: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  target: number;
  progress: number;
  completed: boolean;
  xp_reward: number;
  sort_order: number;
  week_start: string;
  week_end: string;
  all_completed: boolean;
  bonus_xp: number;
  week_streak: number;
  bonus_claimed: boolean;
}

export function useWeeklyChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setChallenges([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("get_weekly_challenges", { _user_id: user.id });
    if (!error && data) setChallenges(data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const claimBonus = useCallback(async () => {
    if (!user) return null;
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_weekly_bonus", { _user_id: user.id });
    setClaiming(false);
    if (error) { toast.error("Couldn't claim bonus"); return null; }
    const result = (data as any)?.[0];
    if (result?.awarded) {
      toast.success(`🎉 +${result.bonus_xp} bonus XP!`, {
        description: `Week streak: ${result.week_streak} 🔥`,
      });
      await refresh();
    } else {
      toast.error(result?.message ?? "Couldn't claim");
    }
    return result;
  }, [user, refresh]);

  const summary = challenges[0];
  const allCompleted = summary?.all_completed ?? false;
  const bonusClaimed = summary?.bonus_claimed ?? false;
  const bonusXp = summary?.bonus_xp ?? 0;
  const weekStreak = summary?.week_streak ?? 0;

  return { challenges, loading, refresh, claimBonus, claiming, allCompleted, bonusClaimed, bonusXp, weekStreak };
}

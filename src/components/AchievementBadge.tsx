import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Achievement } from "@/hooks/useGamification";

const TIER_STYLES: Record<string, string> = {
  bronze: "from-amber-700/20 to-amber-900/10 border-amber-700/40 text-amber-700",
  silver: "from-slate-400/20 to-slate-500/10 border-slate-400/40 text-slate-500",
  gold: "from-yellow-400/25 to-yellow-600/10 border-yellow-500/50 text-yellow-600",
  platinum: "from-primary/25 to-primary/5 border-primary/50 text-primary",
};

interface Props {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
}

export function AchievementBadge({ achievement, unlocked, unlockedAt }: Props) {
  const Icon = (Icons as any)[achievement.icon] ?? Icons.Award;
  const tierStyle = TIER_STYLES[achievement.tier] ?? TIER_STYLES.bronze;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative rounded-xl border p-4 flex flex-col items-center text-center gap-2 bg-gradient-to-br transition-all",
        unlocked ? tierStyle : "bg-muted/30 border-border text-muted-foreground grayscale opacity-60"
      )}
    >
      <div
        className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center border-2",
          unlocked ? "bg-card" : "bg-muted"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-sm text-foreground leading-tight">{achievement.name}</h3>
      <p className="text-xs text-muted-foreground leading-snug">{achievement.description}</p>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-background/50">
          {achievement.tier}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">+{achievement.xp_reward} XP</span>
      </div>
      {unlocked && unlockedAt && (
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Unlocked {new Date(unlockedAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}

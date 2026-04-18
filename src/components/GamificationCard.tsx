import { motion } from "framer-motion";
import { Flame, Trophy, Zap, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useGamification, levelTitle, XP_PER_LEVEL } from "@/hooks/useGamification";

interface Props {
  onOpen: () => void;
}

export function GamificationCard({ onOpen }: Props) {
  const { stats, achievements, unlocked, loading } = useGamification();

  if (loading || !stats) {
    return <div className="rounded-xl bg-card border p-5 h-32 animate-pulse" />;
  }

  const xpInLevel = stats.xp % XP_PER_LEVEL;
  const progress = (xpInLevel / XP_PER_LEVEL) * 100;
  const unlockedCount = unlocked.length;
  const totalCount = achievements.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
            {stats.level}
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Level {stats.level}</p>
            <h3 className="font-serif font-bold text-lg text-foreground leading-tight">{levelTitle(stats.level)}</h3>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onOpen} className="text-primary -mr-2">
          View all
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" />
            {stats.xp} XP
          </span>
          <span className="text-muted-foreground">
            {xpInLevel} / {XP_PER_LEVEL} to lvl {stats.level + 1}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="rounded-lg bg-background/60 border p-2.5 flex flex-col items-center text-center">
          <Flame className="h-4 w-4 text-orange-500 mb-1" />
          <p className="text-lg font-bold text-foreground leading-none">{stats.current_streak}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Day streak</p>
        </div>
        <div className="rounded-lg bg-background/60 border p-2.5 flex flex-col items-center text-center">
          <Trophy className="h-4 w-4 text-yellow-500 mb-1" />
          <p className="text-lg font-bold text-foreground leading-none">
            {unlockedCount}<span className="text-xs text-muted-foreground">/{totalCount}</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Badges</p>
        </div>
        <div className="rounded-lg bg-background/60 border p-2.5 flex flex-col items-center text-center">
          <Zap className="h-4 w-4 text-primary mb-1" />
          <p className="text-lg font-bold text-foreground leading-none">{stats.longest_streak}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Best streak</p>
        </div>
      </div>
    </motion.div>
  );
}

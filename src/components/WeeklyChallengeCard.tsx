import { motion } from "framer-motion";
import { Target, Flame, ChevronRight, Gift, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usePantryData } from "@/context/PantryDataContext";

interface Props {
  onOpen: () => void;
}

export function WeeklyChallengeCard({ onOpen }: Props) {
  const { challenges, loading, allCompleted, bonusClaimed, bonusXp, weekStreak } = usePantryData().challenges;

  if (loading) {
    return <div className="rounded-xl bg-card border p-5 h-32 animate-pulse" />;
  }
  if (!challenges.length) return null;

  const completedCount = challenges.filter((c) => c.completed).length;
  const overall = (completedCount / challenges.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-gradient-to-br from-accent/20 via-card to-card p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">This week</p>
            <h3 className="font-serif font-bold text-lg text-foreground leading-tight">Challenges</h3>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onOpen} className="text-primary -mr-2">
          View all
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">{completedCount} / {challenges.length} complete</span>
          {weekStreak > 0 && (
            <span className="flex items-center gap-1 text-orange-500 font-medium">
              <Flame className="h-3 w-3" /> {weekStreak} wk streak
            </span>
          )}
        </div>
        <Progress value={overall} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {challenges.slice(0, 4).map((c) => {
          const pct = Math.min(100, (Number(c.progress) / Number(c.target)) * 100);
          return (
            <div
              key={c.key}
              className={`rounded-lg border p-2.5 ${c.completed ? "bg-primary/10 border-primary/30" : "bg-background/60"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-medium text-foreground truncate">{c.name}</p>
                {c.completed && <Check className="h-3 w-3 text-primary shrink-0" />}
              </div>
              <Progress value={pct} className="h-1" />
              <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                {Number(c.progress).toFixed(c.type === "kg_saved" ? 1 : 0)} / {Number(c.target).toFixed(c.type === "kg_saved" ? 1 : 0)}
              </p>
            </div>
          );
        })}
      </div>

      {allCompleted && !bonusClaimed && (
        <div className="rounded-lg bg-primary text-primary-foreground p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="text-sm font-medium">Bonus +{bonusXp} XP ready!</span>
          </div>
          <Button size="sm" variant="secondary" onClick={onOpen}>Claim</Button>
        </div>
      )}
    </motion.div>
  );
}

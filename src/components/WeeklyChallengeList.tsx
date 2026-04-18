import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Target, Flame, Gift, Check, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useWeeklyChallenges } from "@/hooks/useWeeklyChallenges";
import { useGamification } from "@/hooks/useGamification";

export function WeeklyChallengeList() {
  const { challenges, loading, claimBonus, claiming, allCompleted, bonusClaimed, bonusXp, weekStreak } =
    useWeeklyChallenges();
  const { refresh: refreshGamification } = useGamification();

  if (loading) {
    return <div className="rounded-xl border p-5 h-48 animate-pulse bg-card" />;
  }
  if (!challenges.length) return null;

  const handleClaim = async () => {
    const res = await claimBonus();
    if (res?.awarded) refreshGamification();
  };

  const weekEnd = new Date(challenges[0].week_end);
  const weekEndLabel = weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold text-foreground font-serif">Weekly Challenges</h2>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary rounded-full px-3 py-0.5">
          Resets {weekEndLabel}
        </span>
      </div>

      {weekStreak > 0 && (
        <div className="rounded-lg border bg-card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Week streak: {weekStreak}</span>
          </div>
          <span className="text-xs text-muted-foreground">Next bonus: +{bonusXp} XP</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {challenges.map((c, i) => {
          const Icon = (Icons as any)[c.icon] ?? Target;
          const pct = Math.min(100, (Number(c.progress) / Number(c.target)) * 100);
          const fmt = (n: number) => Number(n).toFixed(c.type === "kg_saved" ? 1 : 0);
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border p-4 ${c.completed ? "bg-primary/5 border-primary/30" : "bg-card"}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    c.completed ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {c.completed ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="font-bold text-sm text-foreground">{c.name}</h3>
                    <span className="text-xs font-medium text-primary shrink-0">+{c.xp_reward} XP</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{c.description}</p>
                  <Progress value={pct} className="h-2" />
                  <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                    {fmt(Number(c.progress))} / {fmt(Number(c.target))}
                    {c.type === "kg_saved" ? " kg" : c.type === "zero_waste" ? " days clean" : " items"}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div
        className={`rounded-xl border p-4 flex items-center justify-between ${
          allCompleted && !bonusClaimed
            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary"
            : "bg-card"
        }`}
      >
        <div className="flex items-center gap-3">
          {allCompleted && !bonusClaimed ? (
            <Gift className="h-5 w-5" />
          ) : bonusClaimed ? (
            <Check className="h-5 w-5 text-primary" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-bold">
              {bonusClaimed
                ? "Weekly bonus claimed"
                : allCompleted
                ? `Bonus +${bonusXp} XP ready!`
                : `Complete all to unlock +${bonusXp} XP`}
            </p>
            <p className={`text-xs ${allCompleted && !bonusClaimed ? "opacity-90" : "text-muted-foreground"}`}>
              Streak bonus grows each consecutive week
            </p>
          </div>
        </div>
        {allCompleted && !bonusClaimed && (
          <Button variant="secondary" size="sm" onClick={handleClaim} disabled={claiming}>
            {claiming ? "Claiming…" : "Claim"}
          </Button>
        )}
      </div>
    </div>
  );
}

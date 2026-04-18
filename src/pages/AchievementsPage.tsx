import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Zap, Medal, Crown, Award } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useGamification, useLeaderboard, levelTitle, XP_PER_LEVEL } from "@/hooks/useGamification";
import { AchievementBadge } from "@/components/AchievementBadge";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const { stats, achievements, unlocked, loading } = useGamification();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const { rows, loading: lbLoading } = useLeaderboard(period);
  const { user } = useAuth();

  const unlockedMap = new Map(unlocked.map((u) => [u.achievement_id, u.unlocked_at]));

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-card border rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero level card */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-6 flex flex-col items-center text-center gap-3"
        >
          <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-3xl shadow-xl">
            {stats.level}
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Level {stats.level}</p>
            <h2 className="font-serif font-bold text-2xl text-foreground">{levelTitle(stats.level)}</h2>
          </div>
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> {stats.xp} XP total</span>
              <span>{stats.xp % XP_PER_LEVEL}/{XP_PER_LEVEL}</span>
            </div>
            <Progress value={((stats.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100} className="h-2" />
          </div>
          <div className="grid grid-cols-3 gap-3 w-full pt-2">
            <Stat icon={Flame} color="text-orange-500" value={stats.current_streak} label="Current streak" />
            <Stat icon={Trophy} color="text-yellow-500" value={unlocked.length} label={`of ${achievements.length} badges`} />
            <Stat icon={Award} color="text-primary" value={stats.longest_streak} label="Best streak" />
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="badges">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="badges">
            <Trophy className="h-4 w-4 mr-2" /> Badges
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Crown className="h-4 w-4 mr-2" /> Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((a) => (
              <AchievementBadge
                key={a.id}
                achievement={a}
                unlocked={unlockedMap.has(a.id)}
                unlockedAt={unlockedMap.get(a.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-full border bg-card p-1">
              {(["week", "month"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-medium rounded-full transition-colors capitalize",
                    period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  This {p}
                </button>
              ))}
            </div>
          </div>

          {lbLoading ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-card border rounded-lg animate-pulse" />)}</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No activity yet this {period}. Start saving food to claim the top spot!
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => {
                const isMe = row.user_id === user?.id;
                return (
                  <motion.div
                    key={row.user_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                      isMe ? "bg-primary/10 border-primary/40" : "bg-card"
                    )}
                  >
                    <RankBadge rank={Number(row.rank)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {isMe ? "You" : row.email?.split("@")[0] ?? "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.items_consumed} items consumed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-foreground">{Number(row.kg_saved).toFixed(1)} <span className="text-xs font-normal text-muted-foreground">kg</span></p>
                      <p className="text-[10px] text-muted-foreground">saved</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon: Icon, color, value, label }: { icon: any; color: string; value: number; label: string }) {
  return (
    <div className="rounded-lg bg-background/60 border p-3 flex flex-col items-center text-center">
      <Icon className={cn("h-4 w-4 mb-1", color)} />
      <p className="text-xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const styles =
    rank === 1 ? "bg-yellow-500 text-white" :
    rank === 2 ? "bg-slate-400 text-white" :
    rank === 3 ? "bg-amber-700 text-white" :
    "bg-muted text-muted-foreground";
  const Icon = rank <= 3 ? Medal : null;
  return (
    <div className={cn("h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0", styles)}>
      {Icon ? <Icon className="h-4 w-4" /> : `#${rank}`}
    </div>
  );
}

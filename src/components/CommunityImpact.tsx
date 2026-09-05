import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Globe,
  Leaf,
  TrendingDown,
  Package,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";
import { usePantryData } from "@/context/PantryDataContext";
import { UpgradeGate } from "@/components/UpgradeGate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

const TREND_COLORS = {
  saved: "hsl(152,45%,32%)",
  wasted: "hsl(4,60%,52%)",
};

export function CommunityImpact() {
  const { community, subscription } = usePantryData();
  const { data, loading } = community;
  const canSeeMore = subscription.hasAnalytics;
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="rounded-xl border p-6 animate-pulse h-64" />
    );
  }

  if (!data || data.totalItems === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 flex flex-col items-center gap-2 text-muted-foreground">
        <Globe className="h-8 w-8" />
        <p className="text-sm">No community data yet</p>
      </div>
    );
  }

  const totalKg = data.totalSavedKg + data.totalWastedKg;
  const saveRate = totalKg > 0 ? Math.round((data.totalSavedKg / totalKg) * 100) : 0;

  const trendData = data.weeklyTrend.map((w) => ({
    name: format(new Date(w.weekStart), "MMM d"),
    Saved: Number(w.savedKg.toFixed(2)),
    Wasted: Number(w.wastedKg.toFixed(2)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2 text-primary">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <h3 className="font-serif font-bold text-foreground text-lg">Community Impact</h3>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 h-9 w-full">
          <TabsTrigger value="overview" className="text-xs px-1">Overview</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs px-1">Trends</TabsTrigger>
          <TabsTrigger value="contributors" className="text-xs px-1">Top</TabsTrigger>
          <TabsTrigger value="items" className="text-xs px-1">Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<Leaf className="h-3.5 w-3.5" />}
              label="Saved"
              value={`${data.totalSavedKg.toFixed(1)}`}
              unit="kg"
              color="text-success"
            />
            <StatCard
              icon={<TrendingDown className="h-3.5 w-3.5" />}
              label="Wasted"
              value={`${data.totalWastedKg.toFixed(1)}`}
              unit="kg"
              color="text-destructive"
            />
            <StatCard
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Save Rate"
              value={`${saveRate}`}
              unit="%"
              color="text-primary"
            />
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<Package className="h-3.5 w-3.5" />}
              label="Items"
              value={data.totalItems.toLocaleString()}
              unit=""
              color="text-muted-foreground"
            />
            <StatCard
              icon={<Users className="h-3.5 w-3.5" />}
              label="Avg Rate"
              value={`${data.avgSaveRate}`}
              unit="%"
              color="text-muted-foreground"
            />
            <StatCard
              icon={<Trophy className="h-3.5 w-3.5" />}
              label="CO₂ Saved"
              value={`${data.totalCo2SavedKg.toFixed(1)}`}
              unit="kg"
              color="text-success"
            />
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            🌍 Together we've prevented{" "}
            <strong className="text-foreground">{data.totalCo2SavedKg.toFixed(1)} kg</strong> of CO₂
            emissions and tracked{" "}
            <strong className="text-foreground">{data.totalItems.toLocaleString()}</strong> items.
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-3">
          <p className="text-xs text-muted-foreground">Community food saved vs wasted over the last 4 weeks.</p>
          <div className="h-52 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} barCategoryGap="25%">
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Saved" fill={TREND_COLORS.saved} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Wasted" fill={TREND_COLORS.wasted} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="contributors" className="space-y-3">
          <p className="text-xs text-muted-foreground">Top community members by kg saved.</p>
          <div className="space-y-2">
            {data.topContributors.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No contributors yet</p>
            )}
            {data.topContributors.map((c, idx) => (
              <div
                key={c.userId}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                  #{idx + 1}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={c.avatarUrl ?? undefined} alt={c.displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {c.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.itemsConsumed} item{c.itemsConsumed !== 1 ? "s" : ""} consumed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">{c.kgSaved.toFixed(1)} kg</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-3">
          <p className="text-xs text-muted-foreground">Most commonly tracked pantry items.</p>
          <div className="space-y-2">
            {data.commonItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No items yet</p>
            )}
            {data.commonItems.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                    #{idx + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground capitalize">{item.name}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{item.count}</span> tracked ·{" "}
                  {item.totalKg.toFixed(1)} kg
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/40">
      <div className={`flex items-center gap-1.5 ${color}`}>
        {icon}
        <span className="text-[10px] sm:text-xs font-medium">{label}</span>
      </div>
      <p className="text-xl font-serif font-bold text-foreground">
        {value}
        {unit && (
          <span className="text-xs font-sans font-normal text-muted-foreground ml-0.5">{unit}</span>
        )}
      </p>
    </div>
  );
}

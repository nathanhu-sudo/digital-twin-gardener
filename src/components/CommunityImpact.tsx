import { motion } from "framer-motion";
import { Globe, Leaf, TrendingDown } from "lucide-react";
import { usePantryData } from "@/context/PantryDataContext";

export function CommunityImpact() {
  const { data, loading } = usePantryData().community;

  if (loading) {
    return (
      <div className="rounded-xl border p-6 animate-pulse h-40" />
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border p-6 space-y-4"
    >
      <div className="flex items-center gap-2 text-primary">
        <Globe className="h-5 w-5" />
        <h3 className="font-serif font-bold text-foreground text-lg">Community Impact</h3>
      </div>

      {/* Responsive Grid System */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-success">
            <Leaf className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Saved</span>
          </div>
          <p className="text-2xl font-serif font-bold text-foreground">
            {data.totalSavedKg.toFixed(1)}<span className="text-sm font-sans font-normal text-muted-foreground"> kg</span>
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-destructive">
            <TrendingDown className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Wasted</span>
          </div>
          <p className="text-2xl font-serif font-bold text-foreground">
            {data.totalWastedKg.toFixed(1)}<span className="text-sm font-sans font-normal text-muted-foreground"> kg</span>
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-primary">
            <Leaf className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Save Rate</span>
          </div>
          <p className="text-2xl font-serif font-bold text-foreground">
            {saveRate}<span className="text-sm font-sans font-normal text-muted-foreground">%</span>
          </p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        🌍 Together we've prevented <strong className="text-foreground">{data.totalCo2SavedKg.toFixed(1)} kg</strong> of CO₂ emissions
      </div>
    </motion.div>
  );
}

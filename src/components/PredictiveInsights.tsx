import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Brain, AlertTriangle, TrendingUp, Loader2, RefreshCw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { usePantryData } from "@/context/PantryDataContext";
import { toast } from "@/components/ui/sonner";

interface Insights {
  headline: string;
  riskLevel: "low" | "medium" | "high";
  atRiskKg: number;
  forecastSavedKg: number;
  prediction: string;
  tips: string[];
}

export function PredictiveInsights() {
  const { pantry, gamification } = usePantryData();
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);

  const buildContext = useCallback(() => {
    const items = pantry.activeItems.map((i) => ({
      name: i.name,
      weightKg: i.weightKg,
      daysRemaining: pantry.getDaysRemaining(i),
      co2Impact: i.co2Impact,
    }));
    return {
      pantryItems: items,
      expiringSoon: items.filter((i) => i.daysRemaining <= 3),
      impact: pantry.impact,
      stats: gamification.stats,
    };
  }, [pantry, gamification.stats]);

  const generate = useCallback(async () => {
    if (pantry.activeItems.length === 0) return;
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("pantry-insights", {
        body: { pantryContext: buildContext() },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      setData(res);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  }, [buildContext, pantry.activeItems.length]);

  // Auto-load once when items exist
  useEffect(() => {
    if (!data && !loading && pantry.activeItems.length > 0) {
      generate();
    }
  }, [data, loading, pantry.activeItems.length, generate]);

  const riskColor =
    data?.riskLevel === "high"
      ? "bg-destructive/15 text-destructive border-destructive/30"
      : data?.riskLevel === "medium"
      ? "bg-warning/15 text-warning border-warning/30"
      : "bg-success/15 text-success border-success/30";

  if (pantry.activeItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl glass p-5 flex flex-col gap-4 ring-gradient overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl p-2 glow" style={{ background: "var(--gradient-primary)" }}>
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif leading-tight text-gradient">AI Insights</h2>
            <p className="text-[11px] text-muted-foreground">Predictive analysis of your pantry</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={generate} disabled={loading} className="h-8 w-8">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {loading && !data && (
        <div className="flex flex-col gap-2">
          <div className="h-4 rounded shimmer" />
          <div className="h-4 rounded shimmer w-3/4" />
          <div className="h-16 rounded-xl shimmer mt-2" />
        </div>
      )}

      {data && (
        <>
          <div className="flex items-start gap-2">
            <Badge className={`text-[10px] ${riskColor} border capitalize`}>{data.riskLevel} risk</Badge>
            <p className="text-sm font-semibold text-foreground flex-1">{data.headline}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 bg-destructive/5 border border-destructive/20 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                <AlertTriangle className="h-3 w-3" /> At risk
              </div>
              <p className="text-xl font-bold text-destructive">{data.atRiskKg.toFixed(1)} kg</p>
            </div>
            <div className="rounded-xl p-3 bg-success/5 border border-success/20 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> Could save
              </div>
              <p className="text-xl font-bold text-success">{data.forecastSavedKg.toFixed(1)} kg</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">{data.prediction}</p>

          {data.tips.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                <Lightbulb className="h-3 w-3 text-accent" /> Personalized tips
              </div>
              <ul className="flex flex-col gap-1.5">
                {data.tips.map((t, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-primary shrink-0">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

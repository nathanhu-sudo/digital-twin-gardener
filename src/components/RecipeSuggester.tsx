import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, Sparkles, Utensils, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { PantryItem } from "@/types/pantry";

interface Recipe {
  title: string;
  description: string;
  prepTimeMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  usesItems: string[];
  extras: string[];
  steps: string[];
}

interface RecipeSuggesterProps {
  items: PantryItem[];
  getDaysRemaining: (item: PantryItem) => number;
}

export function RecipeSuggester({ items, getDaysRemaining }: RecipeSuggesterProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const generate = async () => {
    if (items.length === 0) {
      toast.error("Add pantry items first to get recipe ideas");
      return;
    }
    setLoading(true);
    setExpanded(null);
    try {
      const payload = items.map((i) => ({
        name: i.name,
        weightKg: i.weightKg,
        daysRemaining: getDaysRemaining(i),
      }));
      const { data, error } = await supabase.functions.invoke("recipe-suggest", {
        body: { items: payload },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRecipes(data?.recipes ?? []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to generate recipes");
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = (d: string) =>
    d === "easy" ? "bg-success/15 text-success" : d === "medium" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";

  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <ChefHat className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-serif leading-tight">Recipe Ideas</h2>
            <p className="text-xs text-muted-foreground">AI-powered, prioritizes expiring items</p>
          </div>
        </div>
        <Button onClick={generate} disabled={loading || items.length === 0} size="sm" className="gap-1.5 shrink-0">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {recipes.length > 0 ? "Refresh" : "Generate"}
        </Button>
      </div>

      {recipes.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {items.length === 0 ? "Add items to your pantry to get recipe suggestions." : "Tap Generate to discover recipes from what's in your pantry."}
        </p>
      )}

      {loading && (
        <div className="flex flex-col gap-2 py-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-xl bg-secondary/50 h-20 animate-pulse" />
          ))}
        </div>
      )}

      <AnimatePresence>
        {recipes.map((r, idx) => {
          const open = expanded === idx;
          return (
            <motion.div
              key={`${r.title}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border bg-background overflow-hidden"
            >
              <button
                onClick={() => setExpanded(open ? null : idx)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-secondary/40 transition-colors"
              >
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{r.title}</h3>
                    <Badge variant="secondary" className={`text-[10px] ${difficultyColor(r.difficulty)}`}>
                      {r.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.prepTimeMinutes} min</span>
                    <span className="flex items-center gap-1"><Utensils className="h-3 w-3" />{r.usesItems.length} pantry items</span>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t"
                  >
                    <div className="p-4 flex flex-col gap-4 bg-secondary/20">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">From your pantry</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {r.usesItems.map((it) => (
                            <Badge key={it} className="bg-primary/15 text-primary hover:bg-primary/20">{it}</Badge>
                          ))}
                        </div>
                      </div>
                      {r.extras.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">You'll also need</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {r.extras.map((it) => (
                              <Badge key={it} variant="outline" className="text-xs">{it}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Steps</h4>
                        <ol className="flex flex-col gap-2">
                          {r.steps.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm text-foreground">
                              <span className="shrink-0 rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-[11px] font-semibold">{i + 1}</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

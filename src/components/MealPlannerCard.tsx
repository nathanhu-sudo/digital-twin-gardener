import { useCallback, useEffect, useMemo, useState } from "react";
import { UtensilsCrossed, Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePantryData } from "@/context/PantryDataContext";
import { toast } from "@/components/ui/sonner";

type Meal = { id: string; plan_date: string; meal: string; title: string };
const MEALS = ["breakfast", "lunch", "dinner"] as const;

function iso(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function MealPlannerCard() {
  const { user } = useAuth();
  const { household, pantry } = usePantryData();
  const hid = household.household?.id ?? null;
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }), []);
  const [selected, setSelected] = useState(iso(days[0]));
  const [meals, setMeals] = useState<Meal[]>([]);
  const [title, setTitle] = useState("");
  const [meal, setMeal] = useState<(typeof MEALS)[number]>("dinner");

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("meal_plans").select("id,plan_date,meal,title")
      .gte("plan_date", iso(days[0])).lte("plan_date", iso(days[6])).order("created_at");
    setMeals((data ?? []) as Meal[]);
  }, [user, days, hid]);
  useEffect(() => { load(); }, [load]);

  const add = async (t = title) => {
    const clean = t.trim().slice(0, 120);
    if (!user || !clean) return;
    const { data, error } = await supabase.from("meal_plans")
      .insert({ user_id: user.id, household_id: hid, plan_date: selected, meal, title: clean })
      .select("id,plan_date,meal,title").single();
    if (error) { toast.error("Couldn't save meal"); return; }
    setMeals((p) => [...p, data as Meal]);
    setTitle("");
  };
  const remove = async (id: string) => {
    setMeals((p) => p.filter((m) => m.id !== id));
    await supabase.from("meal_plans").delete().eq("id", id);
  };

  const expiring = pantry.activeItems
    .filter((i) => pantry.getDaysRemaining(i) <= 3)
    .slice(0, 4);
  const dayMeals = meals.filter((m) => m.plan_date === selected);

  return (
    <Card>
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold text-foreground font-serif">Meal planner</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const k = iso(d);
            const count = meals.filter((m) => m.plan_date === k).length;
            return (
              <button key={k} onClick={() => setSelected(k)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium border transition-colors ${selected === k ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}>
                <div>{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                <div className="text-sm font-bold">{d.getDate()}</div>
                {count > 0 && <div className="text-[10px] opacity-80">{count} meal{count > 1 ? "s" : ""}</div>}
              </button>
            );
          })}
        </div>

        <ul className="flex flex-col gap-2">
          {MEALS.map((m) => dayMeals.filter((x) => x.meal === m).map((x) => (
            <li key={x.id} className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2 text-sm">
              <span><span className="text-xs uppercase text-muted-foreground mr-2">{m}</span>{x.title}</span>
              <button onClick={() => remove(x.id)} aria-label={`Remove ${x.title}`} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </li>
          )))}
          {dayMeals.length === 0 && <li className="text-sm text-muted-foreground">Nothing planned for this day yet.</li>}
        </ul>

        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
          <select value={meal} onChange={(e) => setMeal(e.target.value as typeof meal)}
            className="rounded-md border border-input bg-background px-2 text-sm capitalize">
            {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spinach omelette" maxLength={120} />
          <Button type="submit" size="icon" aria-label="Add meal"><Plus className="h-4 w-4" /></Button>
        </form>

        {expiring.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Plan around soon-to-expire:</span>
            {expiring.map((i) => (
              <button key={i.id} onClick={() => add(`Use up ${i.name}`)}
                className="rounded-full bg-warning/15 border border-warning/30 px-2.5 py-1 font-medium text-foreground hover:bg-warning/25">
                + {i.name}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

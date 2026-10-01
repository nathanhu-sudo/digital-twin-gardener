import { CalendarCheck, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePantryData } from "@/context/PantryDataContext";
import { CO2_MULTIPLIERS, PRICE_PER_KG_USD, PantryItem } from "@/types/pantry";
import { useDetectedCurrency, formatMoney } from "@/lib/currency";

const DAY = 86400000;

function sumWeek(items: PantryItem[], from: number, to: number) {
  const r = { saved: 0, wasted: 0, co2: 0, money: 0, added: 0 };
  for (const i of items) {
    const added = new Date(i.addedAt).getTime();
    if (added >= from && added < to) r.added++;
    if (i.status === "active") continue;
    const t = new Date(i.statusChangedAt ?? i.addedAt).getTime();
    if (t < from || t >= to) continue;
    if (i.status === "consumed") {
      r.saved += i.weightKg;
      r.co2 += i.weightKg * CO2_MULTIPLIERS[i.co2Impact];
      r.money += i.weightKg * PRICE_PER_KG_USD[i.co2Impact];
    } else r.wasted += i.weightKg;
  }
  return r;
}

export function WeeklySummaryCard() {
  const { items } = usePantryData().pantry;
  const currency = useDetectedCurrency();
  const now = Date.now();
  const thisWeek = sumWeek(items, now - 7 * DAY, now + DAY);
  const lastWeek = sumWeek(items, now - 14 * DAY, now - 7 * DAY);
  const total = thisWeek.saved + thisWeek.wasted;
  const savedPct = total > 0 ? Math.round((thisWeek.saved / total) * 100) : 0;
  const wasteDiff = thisWeek.wasted - lastWeek.wasted;

  return (
    <Card>
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold text-foreground font-serif">Your week in review</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <Stat label="Eaten" value={`${thisWeek.saved.toFixed(2)} kg`} />
          <Stat label="Binned" value={`${thisWeek.wasted.toFixed(2)} kg`} />
          <Stat label="CO₂ saved" value={`${thisWeek.co2.toFixed(1)} kg`} />
          <Stat label="Money saved" value={formatMoney(Math.round(thisWeek.money * currency.rate), currency)} />
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          {total === 0 ? (
            <>Use or bin a few items this week to see your summary.</>
          ) : (
            <>
              {wasteDiff <= 0 ? <TrendingDown className="h-4 w-4 text-primary" /> : <TrendingUp className="h-4 w-4 text-destructive" />}
              You ate {savedPct}% of what you finished this week
              {lastWeek.wasted > 0 || thisWeek.wasted > 0
                ? ` — ${Math.abs(wasteDiff).toFixed(2)} kg ${wasteDiff <= 0 ? "less" : "more"} waste than last week.`
                : "."}
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="text-base font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

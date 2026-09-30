import { useMemo } from "react";
import { Zap } from "lucide-react";
import { PantryItem } from "@/types/pantry";
import type { NewPantryItem } from "@/hooks/usePantry";

/** One-tap restock of recently used staples, reusing their last weight/shelf life/location. */
export function QuickAddBar({ items, onAdd }: { items: PantryItem[]; onAdd: (d: NewPantryItem) => Promise<any> }) {
  const recent = useMemo(() => {
    const seen = new Map<string, PantryItem>();
    const sorted = [...items].sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt));
    for (const i of sorted) {
      const key = i.name.trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, i);
      if (seen.size >= 8) break;
    }
    return [...seen.values()];
  }, [items]);

  if (!recent.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-primary" /> Quick restock
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {recent.map((i) => (
          <button
            key={i.id}
            onClick={() =>
              onAdd({ name: i.name, weightKg: i.weightKg, shelfLifeDays: i.shelfLifeDays, co2Impact: i.co2Impact, location: i.location })
            }
            className="shrink-0 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            + {i.name}
          </button>
        ))}
      </div>
    </div>
  );
}

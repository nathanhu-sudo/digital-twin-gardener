import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
import { PantryItem, StorageLocation } from "@/types/pantry";
import { InventoryItem } from "./InventoryItem";

interface InventoryListProps {
  items: PantryItem[];
  getDaysRemaining: (item: PantryItem) => number;
  onConsume: (id: string) => void;
  onToss: (id: string, tossedKg?: number) => void;
  onMove?: (id: string, location: StorageLocation) => void;
}

const FILTERS: { id: "all" | StorageLocation; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fridge", label: "🧊 Fridge" },
  { id: "freezer", label: "❄️ Freezer" },
  { id: "pantry", label: "🥫 Pantry" },
];

export function InventoryList({ items, getDaysRemaining, onConsume, onToss, onMove }: InventoryListProps) {
  const [filter, setFilter] = useState<"all" | StorageLocation>("all");
  const sorted = useMemo(
    () =>
      [...items]
        .filter((i) => filter === "all" || i.location === filter)
        .sort((a, b) => getDaysRemaining(a) - getDaysRemaining(b)),
    [items, getDaysRemaining, filter]
  );

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 flex flex-col items-center gap-3 text-muted-foreground">
        <Package className="h-10 w-10" />
        <p className="font-medium">Your pantry is empty</p>
        <p className="text-sm">Use the scanner to add items</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by storage">
        {FILTERS.map((f) => {
          const count = f.id === "all" ? items.length : items.filter((i) => i.location === f.id).length;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label} <span className="opacity-70">{count}</span>
            </button>
          );
        })}
      </div>
      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nothing stored here yet.
        </p>
      ) : (
        <AnimatePresence mode="popLayout">
          {sorted.map((item) => (
            <InventoryItem
              key={item.id}
              item={item}
              daysRemaining={getDaysRemaining(item)}
              onConsume={onConsume}
              onToss={onToss}
              onMove={onMove}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

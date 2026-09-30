import { useState } from "react";
import { ShoppingCart, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { usePantryData } from "@/context/PantryDataContext";

export function ShoppingListCard() {
  const { shopping, household } = usePantryData();
  const [name, setName] = useState("");
  const open = shopping.items.filter((i) => !i.checked).length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await shopping.add(name);
    setName("");
  };

  return (
    <div className="rounded-xl bg-card border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold text-foreground font-serif">Shopping List</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {open} to buy{household.household ? " · shared" : ""}
        </span>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add an item…" maxLength={100} />
        <Button type="submit" size="icon" disabled={!name.trim()} aria-label="Add to shopping list">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
      {shopping.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Empty. Tip: when you finish something, tap "Add to list" to rebuy it.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {shopping.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-secondary/60">
              <Checkbox checked={i.checked} onCheckedChange={(v) => shopping.toggle(i.id, !!v)} aria-label={`Bought ${i.name}`} />
              <span className={`flex-1 text-sm ${i.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>{i.name}</span>
              <button onClick={() => shopping.remove(i.id)} aria-label={`Remove ${i.name}`} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {shopping.items.some((i) => i.checked) && (
        <Button variant="ghost" size="sm" className="self-end" onClick={shopping.clearChecked}>
          Clear bought items
        </Button>
      )}
    </div>
  );
}

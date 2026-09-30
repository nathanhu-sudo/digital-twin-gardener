import { useState } from "react";
import { Users, Copy, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePantryData } from "@/context/PantryDataContext";

export function HouseholdCard() {
  const { household, pantry, shopping } = usePantryData();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      await Promise.all([pantry.reload(), shopping.refresh()]);
      toast.success(ok);
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const h = household.household;

  return (
    <div className="rounded-xl bg-card border p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-bold text-foreground font-serif">Household</h2>
      </div>
      {h ? (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{h.name}</span> · {household.memberCount} member
            {household.memberCount !== 1 ? "s" : ""}. Pantry items and the shopping list are shared.
          </p>
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-secondary px-3 py-1.5 text-sm font-bold tracking-widest">{h.invite_code}</code>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => { navigator.clipboard.writeText(h.invite_code); toast.success("Invite code copied"); }}
            >
              <Copy className="h-3.5 w-3.5" /> Copy code
            </Button>
            <Button size="sm" variant="ghost" className="gap-1 ml-auto text-muted-foreground" disabled={busy}
              onClick={() => run(household.leave, "You left the household")}>
              <LogOut className="h-3.5 w-3.5" /> Leave
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Share one pantry and shopping list with your partner or flatmates.</p>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Household name" maxLength={60} />
            <Button disabled={busy} onClick={() => run(() => household.create(name), "Household created")}>Create</Button>
          </div>
          <div className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Invite code" maxLength={12} />
            <Button variant="outline" disabled={busy || !code.trim()} onClick={() => run(() => household.join(code), "Joined household")}>Join</Button>
          </div>
        </>
      )}
    </div>
  );
}

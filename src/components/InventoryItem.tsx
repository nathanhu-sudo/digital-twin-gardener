import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Check, Trash2 } from "lucide-react";
import { PantryItem } from "@/types/pantry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface InventoryItemProps {
  item: PantryItem;
  daysRemaining: number;
  onConsume: (id: string) => void;
  onToss: (id: string, tossedKg?: number) => void;
}

function getUrgencyColor(days: number) {
  if (days <= 1) return "text-destructive";
  if (days <= 3) return "text-warning";
  return "text-success";
}

function getUrgencyBg(days: number) {
  if (days <= 1) return "bg-destructive/10";
  if (days <= 3) return "bg-warning/10";
  return "bg-success/10";
}

const co2Labels = { high: "🔴 High", medium: "🟡 Med", low: "🟢 Low" };

export const InventoryItem = forwardRef<HTMLDivElement, InventoryItemProps>(function InventoryItem(
  { item, daysRemaining, onConsume, onToss },
  ref
) {
  const [showTossPrompt, setShowTossPrompt] = useState(false);
  const [tossAmount, setTossAmount] = useState(String(item.weightKg));
  const [tossing, setTossing] = useState(false);

  const handleTossClick = () => {
    setTossAmount(String(item.weightKg));
    setShowTossPrompt(true);
  };

  const handleTossConfirm = async () => {
    const amount = parseFloat(tossAmount);
    if (!amount || amount <= 0 || amount > item.weightKg) return;
    setTossing(true);
    try {
      await onToss(item.id, amount);
      setShowTossPrompt(false);
    } finally {
      setTossing(false);
    }
  };

  return (
    <>
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="rounded-xl bg-card border p-4 flex items-center gap-4"
      >
        <div className={`rounded-lg p-2.5 ${getUrgencyBg(daysRemaining)}`}>
          <Clock className={`h-5 w-5 ${getUrgencyColor(daysRemaining)}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{item.name}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span>{item.weightKg} kg</span>
            <span>CO₂: {co2Labels[item.co2Impact]}</span>
          </div>
        </div>

        <div className="text-right mr-2">
          <p className={`text-lg font-serif font-bold ${getUrgencyColor(daysRemaining)}`}>
            {daysRemaining <= 0 ? "Expired" : `${daysRemaining}d`}
          </p>
          <p className="text-[10px] text-muted-foreground">remaining</p>
        </div>

        <div className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-success/30 text-success hover:bg-success hover:text-success-foreground"
            onClick={() => onConsume(item.id)}
            title="Mark as consumed"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleTossClick}
            title="Mark as tossed"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <Dialog open={showTossPrompt} onOpenChange={setShowTossPrompt}>
        {showTossPrompt && (
        <DialogContent className="sm:max-w-sm" aria-describedby={`toss-desc-${item.id}`}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-destructive/10 p-2">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <DialogTitle className="font-serif">Toss "{item.name}"</DialogTitle>
            </div>
            <DialogDescription id={`toss-desc-${item.id}`}>
              How much are you tossing? (Total: {item.weightKg} kg)
              {item.weightKg > parseFloat(tossAmount || "0") && parseFloat(tossAmount || "0") > 0 && (
                <span className="block mt-1 text-success">
                  Remaining {(item.weightKg - parseFloat(tossAmount || "0")).toFixed(2)} kg will count as food saved!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`toss-amount-${item.id}`}>Amount to toss (kg)</Label>
            <Input
              id={`toss-amount-${item.id}`}
              type="number"
              min="0.01"
              max={item.weightKg}
              step="any"
              value={tossAmount}
              onChange={(e) => setTossAmount(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowTossPrompt(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={tossing || !parseFloat(tossAmount) || parseFloat(tossAmount) <= 0 || parseFloat(tossAmount) > item.weightKg}
              onClick={handleTossConfirm}
            >
              {tossing ? "Tossing…" : "Confirm toss"}
            </Button>
          </DialogFooter>
        </DialogContent>
        )}
      </Dialog>
    </>
  );
});

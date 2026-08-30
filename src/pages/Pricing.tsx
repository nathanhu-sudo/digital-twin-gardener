import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, X, Leaf, Sparkles, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PLANS, PlanId, planName } from "@/lib/plans";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, loading, changePlan } = useSubscription();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [busy, setBusy] = useState<PlanId | null>(null);

  const select = async (next: PlanId) => {
    if (!user) {
      navigate("/auth?redirect=/pricing");
      return;
    }
    setBusy(next);
    try {
      await changePlan(next, billing);
      toast.success(
        next === "free" ? "Switched to Free." : `${planName(next)} activated — enjoy the unlocked features!`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not change plan");
    } finally {
      setBusy(null);
    }
  };

  const priceLabel = (p: (typeof PLANS)[number]) => {
    if (p.oneOff) return { amount: `$${p.oneOff}`, period: "one-time" };
    if (p.monthly === 0) return { amount: "$0", period: "forever" };
    if (billing === "yearly" && p.yearly) return { amount: `$${p.yearly}`, period: "/year" };
    return { amount: `$${p.monthly}`, period: "/month" };
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed inset-0 -z-20 opacity-[0.07] bg-[url(/auth-bg.jpg)] bg-repeat pointer-events-none"
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 bg-mesh pointer-events-none" aria-hidden="true" />

      <header className="border-b border-border/50 glass sticky top-0 z-20">
        <div className="container max-w-5xl px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="font-serif font-bold text-lg ml-2">Plans & Pricing</h1>
        </div>
      </header>

      <main className="container max-w-5xl px-4 py-12 pb-24">
        <div className="text-center flex flex-col items-center gap-3 mb-10">
          <div className="rounded-2xl p-2.5 shadow-lg glow" style={{ background: "var(--gradient-primary)" }}>
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-gradient">
            Waste less. Unlock more.
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Start free, upgrade when your pantry outgrows it. Cancel any time.
          </p>

          <div className="inline-flex items-center rounded-full border border-border/60 glass p-1 mt-2">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  billing === b ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {b === "monthly" ? "Monthly" : "Yearly · save ~30%"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p, i) => {
            const price = priceLabel(p);
            const current = plan === p.id;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative flex flex-col rounded-2xl border p-5 glass ${
                  p.highlight ? "border-primary/60 shadow-lg" : "border-border/60"
                }`}
              >
                {p.highlight && (
                  <Badge className="absolute -top-2.5 left-5 gap-1">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </Badge>
                )}
                {p.id === "lifetime" && (
                  <Badge variant="secondary" className="absolute -top-2.5 left-5 gap-1">
                    <InfinityIcon className="h-3 w-3" /> Pay once
                  </Badge>
                )}

                <h3 className="font-serif font-bold text-lg text-foreground">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 min-h-[32px]">{p.tagline}</p>

                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-bold text-foreground">{price.amount}</span>
                  <span className="text-xs text-muted-foreground">{price.period}</span>
                </div>

                <ul className="flex flex-col gap-2 mt-5 flex-1">
                  {p.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2 text-xs">
                      {f.included ? (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/70 line-through"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-5 w-full"
                  variant={p.highlight ? "default" : current ? "secondary" : "outline"}
                  disabled={current || loading || busy !== null}
                  onClick={() => select(p.id)}
                >
                  {current
                    ? "Current plan"
                    : busy === p.id
                      ? "Activating…"
                      : p.id === "free"
                        ? "Switch to Free"
                        : p.oneOff
                          ? "Buy Lifetime"
                          : `Choose ${p.name}`}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-lg mx-auto">
          Checkout is in demo mode — plans activate instantly and no money changes hands. Real card payments switch on
          once billing is connected.
        </p>
      </main>
    </div>
  );
}

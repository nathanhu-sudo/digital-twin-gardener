import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { planName, PlanId } from "@/lib/plans";

type Props = {
  allowed: boolean;
  requires: PlanId;
  title: string;
  description: string;
  children: ReactNode;
  /** Render locked content blurred behind the prompt instead of hiding it */
  preview?: boolean;
};

export function UpgradeGate({ allowed, requires, title, description, children, preview = true }: Props) {
  const navigate = useNavigate();
  if (allowed) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60">
      {preview && (
        <div className="pointer-events-none select-none blur-[6px] opacity-40 max-h-[420px] overflow-hidden" aria-hidden="true">
          {children}
        </div>
      )}
      <div
        className={`${preview ? "absolute inset-0" : ""} flex flex-col items-center justify-center gap-3 text-center p-6 glass-strong`}
      >
        <div className="rounded-2xl p-2.5 shadow-lg" style={{ background: "var(--gradient-primary)" }}>
          <Lock className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">{description}</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate("/pricing")}>
          <Sparkles className="h-4 w-4" />
          Unlock with {planName(requires)}
        </Button>
      </div>
    </div>
  );
}

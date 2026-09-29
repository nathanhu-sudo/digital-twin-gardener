import { Bell, ScanLine, Trophy, BarChart2, TrendingUp, Mail, Bot, ChefHat, Sparkles, Users } from "lucide-react";

const FREE_FEATURES = [
  {
    icon: Bell,
    title: "Expiry Alerts",
    desc: "Track every item's shelf life and get nudged in-app before food goes to waste.",
  },
  {
    icon: ScanLine,
    title: "AI Scanner",
    desc: "Snap your fridge, receipt or a barcode and vision AI pulls out every item, weight and shelf life in seconds.",
  },
  {
    icon: Trophy,
    title: "Rewards & Streaks",
    desc: "Level up, earn badges, tackle weekly challenges and keep your waste-saving streak alive.",
  },
  {
    icon: BarChart2,
    title: "Green Impact",
    desc: "Track the kilograms saved and the CO₂ you prevented, for yourself and the whole community.",
  },
];

const EXCLUSIVE_FEATURES = [
  {
    icon: TrendingUp,
    plan: "Lite",
    title: "Analytics & History",
    desc: "See charts of your pantry over time, from what you used to what you saved and tossed.",
  },
  {
    icon: Mail,
    plan: "Lite",
    title: "Email Reminders",
    desc: "Get expiry warnings straight to your inbox, even when the app is closed.",
  },
  {
    icon: Bot,
    plan: "Pro",
    title: "Pantry Assistant",
    desc: "Ask anything about your food. Gemini 2.5 Pro answers with what's actually in your kitchen right now.",
  },
  {
    icon: ChefHat,
    plan: "Pro",
    title: "Smart Recipes",
    desc: "Get recipe ideas that prioritise what's about to expire, so you cook first and shop later.",
  },
  {
    icon: Sparkles,
    plan: "Pro",
    title: "Predictive Insights",
    desc: "AI spots waste risk before it happens and tells you exactly what to use tonight.",
  },
  {
    icon: Users,
    plan: "Pro",
    title: "Friends & Leaderboards",
    desc: "Add friends, compare impact and climb the community leaderboard together.",
  },
];

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  plan,
}: {
  icon: typeof Bell;
  title: string;
  desc: string;
  plan?: string;
}) => (
  <div
    className="glass rounded-2xl border border-border/50 p-6 pt-7 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center h-full"
  >
    <div
      className="rounded-2xl p-3.5 shadow-md mb-4"
      style={{ background: "var(--gradient-primary)" }}
    >
      <Icon className="h-6 w-6 text-primary-foreground" />
    </div>
    <div className="font-semibold text-lg mb-1.5">{title}</div>
    {plan && (
      <span className="mb-3 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
        {plan}
      </span>
    )}
    <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
  </div>
);

const STEPS = [
  { n: "01", title: "Add your groceries", desc: "Scan, snap or type. It takes seconds." },
  { n: "02", title: "Cook & consume", desc: "Get nudged before food goes bad." },
  { n: "03", title: "Watch your impact grow", desc: "Kg saved, CO₂ prevented, streaks unlocked." },
];

export function FeaturesContent() {
  return <>
      {/* Free features */}
      <section className="container max-w-6xl mx-auto px-4 py-20 sm:py-28">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
            Everything your kitchen needs
          </h2>
          <p className="text-primary font-medium mt-3">
            Included with your free account
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {FREE_FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* Paid exclusives */}
      <section className="container max-w-6xl mx-auto px-4 pb-20 sm:pb-28">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
            Exclusives
          </h2>
          <p className="text-primary font-medium mt-3">
            Unlock with Lite or Pro
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {EXCLUSIVE_FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

  </>;
}

export function HowContent() {
  return <>
      {/* How it works */}
      <section className="container max-w-6xl mx-auto px-4 py-20 sm:py-28">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
            Three steps to a smarter kitchen
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="glass rounded-2xl border border-border/50 p-6 flex flex-col gap-2"
            >
              <div className="text-xs font-mono text-primary">{s.n}</div>
              <div className="text-lg font-semibold">{s.title}</div>
              <div className="text-sm text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

  </>;
}

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  ScanLine,
  Sparkles,
  TrendingUp,
  Trophy,
  ChefHat,
  Bot,
  ArrowRight,
  BarChart2,
  ShieldCheck,
  Apple,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-illustration.jpg";

const FEATURES = [
  {
    icon: ScanLine,
    title: "AI Scanner",
    desc: "Snap your fridge, receipt or a barcode — vision AI extracts every item, weight and shelf life in seconds.",
  },
  {
    icon: Bot,
    title: "Pantry Assistant",
    desc: "Ask anything about your food. Gemini 2.5 Pro answers with what's actually in your kitchen right now.",
  },
  {
    icon: ChefHat,
    title: "Smart Recipes",
    desc: "Get recipe ideas that prioritise what's about to expire — cook first, shop later.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Insights",
    desc: "AI spots waste risk before it happens and tells you exactly what to use tonight.",
  },
  {
    icon: Trophy,
    title: "Rewards & Streaks",
    desc: "Level up, earn badges, tackle weekly challenges and climb the community leaderboard.",
  },
  {
    icon: BarChart2,
    title: "Green Impact",
    desc: "Track every kilogram saved and CO₂ prevented — for you and the SmartPantry community.",
  },
];

const STEPS = [
  { n: "01", title: "Add your groceries", desc: "Scan, snap or type. It takes seconds." },
  { n: "02", title: "Cook & consume", desc: "Get nudged before food goes bad." },
  { n: "03", title: "Watch your impact grow", desc: "Kg saved, CO₂ prevented, streaks unlocked." },
];

export default function Landing() {
  const { user } = useAuth();
  const ctaTo = user ? "/app" : "/auth";
  const ctaLabel = user ? "Open your pantry" : "Get started free";

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-mesh pointer-events-none" aria-hidden="true" />

      {/* Nav */}
      <header className="sticky top-0 z-30 glass border-b border-border/40">
        <div className="container max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="rounded-xl p-2 shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-gradient font-serif">SmartPantry AI</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <a
              href="#features"
              className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Features
            </a>
            <a
              href="#how"
              className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              How it works
            </a>
            {user ? (
              <Button asChild size="sm">
                <Link to="/app">Open app</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth">Get started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/70" />
        <div className="relative container max-w-6xl mx-auto px-4 py-20 sm:py-28 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5"
          >
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Your kitchen's digital twin
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight leading-[1.05]">
              Eat more. <span className="text-gradient">Waste less.</span>
              <br /> Powered by AI.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg">
              SmartPantry AI tracks what's in your kitchen, warns you before food expires,
              suggests recipes with what you already have, and turns every kilogram saved into
              measurable impact.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Button asChild size="lg" className="gap-2 shadow-lg">
                <Link to={ctaTo}>
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">See features</a>
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Free to use
              </span>
              <span className="inline-flex items-center gap-1">
                <Leaf className="h-3.5 w-3.5 text-primary" /> No credit card
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="glass-strong rounded-3xl border border-border/50 shadow-elegant p-6 sm:p-8 flex flex-col items-center gap-4">
              <div className="mx-auto w-full max-w-[260px] rounded-[2.5rem] border border-border/60 bg-background/90 shadow-2xl overflow-hidden ring-8 ring-border/20">
                {/* Phone notch / status bar */}
                <div className="relative h-7 bg-background/95 border-b border-border/30 flex items-center justify-center">
                  <div className="absolute top-1.5 h-4 w-20 rounded-full bg-foreground/10" />
                  <span className="absolute right-4 text-[10px] font-medium text-muted-foreground">
                    9:41
                  </span>
                </div>

                {/* App preview body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Your pantry</div>
                      <div className="text-sm font-semibold">12 items</div>
                    </div>
                    <div
                      className="rounded-full p-1.5"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Leaf className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  </div>

                  {[
                    { name: "Spinach", detail: "Use in 2 days", tone: "text-warning" },
                    { name: "Milk", detail: "5 days left", tone: "text-primary" },
                    { name: "Eggs", detail: "12 days left", tone: "text-primary" },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl bg-card border border-border/50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg p-1 bg-primary/10">
                          <Apple className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-medium">{item.name}</span>
                      </div>
                      <span className={`text-[10px] font-medium ${item.tone}`}>
                        {item.detail}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-end pt-1">
                    <div
                      className="rounded-full p-2 shadow-lg"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Plus className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                A preview of your SmartPantry screen
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container max-w-6xl mx-auto px-4 py-20 sm:py-28">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
            Everything your kitchen needs
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Six connected tools — one calm, beautiful app.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="glass rounded-2xl border border-border/50 p-5 hover:shadow-elegant transition-shadow"
            >
              <div
                className="rounded-xl p-2.5 w-fit shadow-md mb-3"
                style={{ background: "var(--gradient-primary)" }}
              >
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="font-semibold text-lg mb-1">{f.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
            Three steps to a smarter kitchen
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
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

      {/* CTA */}
      <section className="container max-w-4xl mx-auto px-4 pb-20">
        <div
          className="relative overflow-hidden rounded-3xl border border-border/50 p-8 sm:p-12 text-center shadow-elegant"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="relative z-10 flex flex-col items-center gap-4 text-primary-foreground">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">
              Start saving food today.
            </h2>
            <p className="max-w-md opacity-90">
              Join SmartPantry AI and turn everyday cooking into measurable planet-positive impact.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2 mt-2">
              <Link to={ctaTo}>
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SmartPantry AI · Built with Lovable Cloud
      </footer>
    </div>
  );
}

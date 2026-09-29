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
  Facebook,
  Instagram,
  Bell,
  Mail,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { InteractivePantryPreview } from "@/components/InteractivePantryPreview";
import { useAuth } from "@/hooks/useAuth";

const FREE_FEATURES = [
  {
    icon: Bell,
    title: "Expiry Alerts",
    desc: "Track every item's shelf life and get nudged in-app before food goes to waste.",
  },
  {
    icon: ScanLine,
    title: "AI Scanner",
    desc: "Snap your fridge, receipt or a barcode — vision AI extracts every item, weight and shelf life in seconds.",
  },
  {
    icon: Trophy,
    title: "Rewards & Streaks",
    desc: "Level up, earn badges, tackle weekly challenges and keep your waste-saving streak alive.",
  },
  {
    icon: BarChart2,
    title: "Green Impact",
    desc: "Track every kilogram saved and CO₂ prevented — for you and the SmartPantry community.",
  },
];

const EXCLUSIVE_FEATURES = [
  {
    icon: TrendingUp,
    plan: "Lite",
    title: "Analytics & History",
    desc: "See charts of your pantry over time — what you used, saved and tossed.",
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
    desc: "Get recipe ideas that prioritise what's about to expire — cook first, shop later.",
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
  index = 0,
}: {
  icon: typeof Bell;
  title: string;
  desc: string;
  plan?: string;
  index?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.35, delay: 0.05 + index * 0.07 }}
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
  </motion.div>
);

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
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Page-wide fruit & veg pattern, hidden behind the final CTA */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none opacity-80"
        style={{
          backgroundImage: "url(/auth-bg.jpg)",
          backgroundSize: "480px 480px",
          backgroundRepeat: "repeat",
        }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 bg-mesh pointer-events-none" aria-hidden="true" />

      {/* Nav */}
      <header className="sticky top-0 z-30 glass border-b border-border/40">
        <div className="container max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo showName className="h-9 w-9" nameClassName="text-lg" />
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
            <Link
              to="/pricing"
              className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Pricing
            </Link>

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
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 62%, transparent 97%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 62%, transparent 97%)",
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--primary) / 0.06), hsl(var(--background) / 0.7) 60%, hsl(var(--background) / 0.3) 92%, transparent)",
            }}
          />
        </div>
        <div className="relative container max-w-6xl mx-auto px-4 py-20 sm:py-28 grid md:grid-cols-2 gap-10 md:items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5 md:-mt-[70px]"
          >
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Your kitchen's digital twin
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight leading-[1.05]">
              Eat more. <span className="text-gradient whitespace-nowrap">Waste less.</span>
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
            <div className="flex flex-col items-center gap-3 pt-2 self-center w-full">
              <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Socials</p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61591816062382"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SmartPantry AI on Facebook"
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-110 shadow-md"
                  style={{ background: "#1877F2" }}
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="https://www.instagram.com/smart.pantry.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SmartPantry AI on Instagram"
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-110 shadow-md"
                  style={{ background: "linear-gradient(45deg, #F58529 0%, #DD2A7B 55%, #8134AF 80%, #515BD4 100%)" }}
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground text-center">Follow SmartPantry AI for waste-saving tips</p>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative flex flex-col items-center gap-4">
              <InteractivePantryPreview />

              <p className="text-xs text-muted-foreground text-center">
                Explore the sample pantry — changes stay in this demo
              </p>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Free features */}
      <section id="features" className="container max-w-6xl mx-auto px-4 py-20 sm:py-28">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
            Everything your kitchen needs
          </h2>
          <p className="text-primary font-medium mt-3">
            Included with your free account
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {FREE_FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
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
          {EXCLUSIVE_FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container max-w-6xl mx-auto px-4 py-20 sm:py-28">
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

      {/* CTA — pattern shows through */}
      <section className="container max-w-4xl mx-auto px-4 py-20 sm:py-28">
        <div
          className="relative overflow-hidden rounded-3xl border border-border/50 p-8 sm:p-12 text-center shadow-elegant"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="relative z-10 flex flex-col items-center gap-5 text-primary-foreground">
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


      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-5">
          <a
            href="https://www.facebook.com/profile.php?id=61591816062382"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SmartPantry AI on Facebook"
            className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-110 shadow-md"
            style={{ background: "#1877F2" }}
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="https://www.instagram.com/smart.pantry.ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SmartPantry AI on Instagram"
            className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-110 shadow-md"
            style={{ background: "linear-gradient(45deg, #F58529 0%, #DD2A7B 55%, #8134AF 80%, #515BD4 100%)" }}
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} SmartPantry AI</p>
        <div className="inline-flex items-center justify-center gap-6 mt-4 px-6 py-3 rounded-2xl border border-border/50 bg-background/70 backdrop-blur-sm">
          <Link to="/guides" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Guides</Link>
          <Link to="/terms" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Terms</Link>
          <Link to="/privacy" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Privacy</Link>
          <Link to="/refund" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Refunds</Link>
        </div>
      </footer>
    </div>
  );
}

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Facebook,
  Instagram,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingPageNav } from "@/components/LandingPageNav";
import { InteractivePantryPreview } from "@/components/InteractivePantryPreview";
import { useAuth } from "@/hooks/useAuth";
import { LandingFAQ } from "@/components/LandingFAQ";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { PiggyBank } from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

const SAVINGS_NOTES = [
  <>Households bin roughly <strong>a fifth of the food they buy</strong>. See exactly what you save, in your own currency, every time you use something up.</>,
  <>The average family throws away <strong>hundreds of dollars of food a year</strong>. SmartPantry AI shows your savings adding up, item by item.</>,
  <>Every item you mark as used turns into <strong>money saved, kilograms kept, and CO₂ avoided</strong> — tracked automatically in your own currency.</>,
];

function RotatingSavingsNote() {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((i) => (i + 1) % SAVINGS_NOTES.length);
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="inline-flex items-start gap-2 rounded-xl border border-primary/25 bg-card/80 px-4 py-3 text-sm text-foreground max-w-lg min-h-[76px]">
      <PiggyBank className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="min-w-0"
        >
          {SAVINGS_NOTES[index]}
        </motion.span>
      </AnimatePresence>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Show next saving tip"
        title="Show next tip"
        onClick={next}
        className="shrink-0 -mt-1 -mr-1 rounded-full h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const ctaTo = user ? "/app" : "/auth";
  const ctaLabel = user ? "Open your pantry" : "Get started free";
  return (
    <div id="top" className="min-h-screen flex flex-col relative overflow-x-hidden">
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

      <LandingPageNav home />

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
            <RotatingSavingsNote />
            <div className="flex flex-wrap gap-3 mt-2">
              <Button asChild size="lg" className="gap-2 shadow-lg">
                <Link to={ctaTo}>
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/features">See features</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Free plan available
              </span>
              <span className="inline-flex items-center gap-1">
                <Leaf className="h-3.5 w-3.5 text-primary" /> No card needed to sign up
              </span>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative md:-mt-16"
          >
            <div className="relative flex flex-col items-center gap-4">
              <InteractivePantryPreview />

              <p className="text-xs text-muted-foreground text-center">
                Explore the sample pantry. Warning: changes stay in this demo
              </p>
            </div>
          </motion.div>
        </div>

        {/* Full-width socials band */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mt-8 sm:mt-10 w-full flex flex-col items-center gap-5 text-center"
        >
          <p className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-[hsl(var(--foreground))]">Socials</p>
          <div className="flex w-full max-w-4xl flex-col items-center gap-4 px-6 sm:flex-row sm:items-stretch sm:justify-between sm:gap-8 sm:px-12">
            <a
              href="https://www.facebook.com/profile.php?id=61591816062382"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full sm:w-auto min-w-[240px] items-center gap-3 rounded-full px-6 py-3.5 text-white shadow-lg transition-transform duration-300 hover:scale-[1.03]"
              style={{ background: "#1877F2" }}
              aria-label="SmartPantry AI on Facebook"
            >
              <Facebook className="h-6 w-6 shrink-0" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-base font-semibold">Follow us on Facebook</span>
                <span className="text-sm text-white/80">Waste-saving tips and product updates</span>
              </span>
            </a>
            <a
              href="https://www.instagram.com/smart.pantry.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full sm:w-auto min-w-[240px] items-center gap-3 rounded-full px-6 py-3.5 text-white shadow-lg transition-transform duration-300 hover:scale-[1.03]"
              style={{ background: "linear-gradient(45deg, #F58529 0%, #DD2A7B 55%, #8134AF 80%, #515BD4 100%)" }}
              aria-label="SmartPantry AI on Instagram"
            >
              <Instagram className="h-6 w-6 shrink-0" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-base font-semibold">Follow us on Instagram</span>
                <span className="text-sm text-white/80">Kitchen inspiration and pantry makeovers</span>
              </span>
            </a>
          </div>
          <p className="text-sm font-bold text-[hsl(var(--foreground))] text-center">Follow SmartPantry AI for waste-saving tips</p>
        </motion.div>
      </section>


      <LandingFAQ />

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
            className="flex items-center gap-2.5 rounded-full px-6 py-3.5 text-white shadow-lg transition-transform duration-300 hover:scale-[1.03]"
            style={{ background: "#1877F2" }}
          >
            <Facebook className="h-6 w-6 shrink-0" />
            <span className="text-base font-semibold">Facebook</span>
          </a>
          <a
            href="https://www.instagram.com/smart.pantry.ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SmartPantry AI on Instagram"
            className="flex items-center gap-2.5 rounded-full px-6 py-3.5 text-white shadow-lg transition-transform duration-300 hover:scale-[1.03]"
            style={{ background: "linear-gradient(45deg, #F58529 0%, #DD2A7B 55%, #8134AF 80%, #515BD4 100%)" }}
          >
            <Instagram className="h-6 w-6 shrink-0" />
            <span className="text-base font-semibold">Instagram</span>
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
      <InstallAppBanner />
    </div>
  );
}

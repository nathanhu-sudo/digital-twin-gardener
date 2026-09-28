import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { guides } from "@/lib/guides";

export default function GuidesIndex() {
  useEffect(() => {
    document.title = "Kitchen Guides — Waste Less Food | SmartPantry AI";
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute(
      "content",
      "Practical guides to reducing food waste at home: smarter shopping, pantry organization, and how to choose a pantry inventory app that sticks."
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 glass sticky top-0 z-20">
        <div className="container max-w-3xl px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-10 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <BrandLogo className="h-10 w-10 rounded-xl shadow" />
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide">SmartPantry AI</p>
            <h1 className="text-2xl font-bold font-serif tracking-tight">Kitchen Guides</h1>
          </div>
        </div>

        <p className="text-lg text-muted-foreground">
          Practical, no-fluff guides to wasting less food — smarter shopping, better storage, and the
          systems that keep your kitchen honest.
        </p>

        <div className="mt-8 space-y-4">
          {guides.map((g) => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className="block rounded-3xl border border-border/60 bg-card p-6 hover:border-primary/40 hover:shadow-elegant transition-all"
            >
              <h2 className="text-lg sm:text-xl font-bold font-serif tracking-tight leading-snug">
                {g.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{g.tagline}</p>
              <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock3 className="h-3 w-3" /> {g.readingTime} · Updated {g.updated}
              </p>
            </Link>
          ))}
        </div>

        <div
          className="relative overflow-hidden rounded-3xl border border-border/50 p-6 sm:p-8 mt-10 shadow-elegant"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="relative z-10 text-primary-foreground">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium opacity-90">
              <Sparkles className="h-3.5 w-3.5" /> Free forever plan
            </p>
            <h3 className="text-xl font-bold font-serif mt-2">Put your pantry on autopilot.</h3>
            <p className="mt-2 text-sm opacity-90 max-w-lg">
              SmartPantry AI warns you before food expires, suggests recipes from what you already have,
              and turns saved food into XP. Free to start — no credit card.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2 mt-4">
              <Link to="/auth">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-4">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}

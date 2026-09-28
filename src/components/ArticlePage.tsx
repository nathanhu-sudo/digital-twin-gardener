import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { type Guide } from "@/lib/guides";

function faqJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function articleJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: "2026-09-28",
    dateModified: "2026-09-28",
    author: { "@type": "Organization", name: "SmartPantry AI" },
    publisher: { "@type": "Organization", name: "SmartPantry AI" },
    mainEntityOfPage: `https://smartpantryai.co/guides/${guide.slug}`,
  };
}

export function ArticlePage({ guide }: { guide: Guide }) {
  useEffect(() => {
    document.title = guide.metaTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", guide.description);

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `jsonld-${guide.slug}`;
    script.text = JSON.stringify([articleJsonLd(guide), faqJsonLd(guide)]);
    document.head.appendChild(script);
    return () => {
      document.getElementById(`jsonld-${guide.slug}`)?.remove();
    };
  }, [guide]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 glass sticky top-0 z-20">
        <div className="container max-w-3xl px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link to="/guides">
              <ArrowLeft className="h-4 w-4" />
              All guides
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-10 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <BrandLogo className="h-10 w-10 rounded-xl shadow" />
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide">SmartPantry AI Guides</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock3 className="h-3 w-3" /> {guide.readingTime} · Updated {guide.updated}
            </p>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight leading-tight">
          {guide.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{guide.tagline}</p>

        <div className="mt-6 space-y-3">
          {guide.intro.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
        </div>

        {guide.sections.map((section, si) => (
          <div key={section.heading}>
            <section className="mt-10">
              <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight mb-3">
                {section.heading}
              </h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="text-base leading-relaxed text-foreground/90 mb-3">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-2.5 mt-3">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2.5 text-base leading-relaxed text-foreground/90">
                      <Leaf className="h-4 w-4 mt-1.5 shrink-0 text-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {si === guide.ctaAfterSection && (
              <div
                className="relative overflow-hidden rounded-3xl border border-border/50 p-6 sm:p-8 mt-10 shadow-elegant"
                style={{ background: "var(--gradient-primary)" }}
              >
                <div className="relative z-10 text-primary-foreground">
                  <h3 className="text-xl font-bold font-serif">Let your pantry remember for you.</h3>
                  <p className="mt-2 text-sm opacity-90 max-w-lg">
                    SmartPantry AI tracks what's in your kitchen, warns you before food expires, and shows
                    the kilograms you've saved. Free to start — no credit card.
                  </p>
                  <Button asChild size="lg" variant="secondary" className="gap-2 mt-4">
                    <Link to="/auth">
                      Start free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        <section className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {guide.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-border/60 bg-card px-5 py-4"
              >
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between gap-3 text-sm sm:text-base">
                  {f.q}
                  <span className="text-primary text-lg leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Keep reading
          </h2>
          <div className="grid gap-3">
            {guides
              .filter((g) => g.slug !== guide.slug)
              .map((g) => (
                <Link
                  key={g.slug}
                  to={`/guides/${g.slug}`}
                  className="rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-elegant transition-all"
                >
                  <p className="font-medium text-sm sm:text-base">{g.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{g.tagline}</p>
                </Link>
              ))}
          </div>
        </section>
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

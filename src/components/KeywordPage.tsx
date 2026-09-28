import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { keywordPages, type KeywordPage } from "@/lib/keywordPages";

function webPageJsonLd(page: KeywordPage) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.metaTitle,
    description: page.description,
    url: `https://smartpantryai.co/${page.slug}`,
  };
}

function faqJsonLd(page: KeywordPage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function KeywordPageView({ page }: { page: KeywordPage }) {
  useEffect(() => {
    document.title = page.metaTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", page.description);

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `jsonld-kw-${page.slug}`;
    script.text = JSON.stringify([webPageJsonLd(page), faqJsonLd(page)]);
    document.head.appendChild(script);
    return () => {
      document.getElementById(`jsonld-kw-${page.slug}`)?.remove();
    };
  }, [page]);

  const others = keywordPages.filter((p) => p.slug !== page.slug);

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
          <p className="text-xs font-medium text-primary uppercase tracking-wide">SmartPantry AI</p>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight leading-tight">
          {page.h1}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{page.tagline}</p>

        <div className="mt-6 space-y-3">
          {page.intro.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
        </div>

        <div
          className="relative overflow-hidden rounded-3xl border border-border/50 p-6 sm:p-8 mt-8 shadow-elegant"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="relative z-10 text-primary-foreground">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium opacity-90">
              <Sparkles className="h-3.5 w-3.5" /> Free forever plan
            </p>
            <h2 className="text-xl font-bold font-serif mt-2">Try it on your own kitchen.</h2>
            <p className="mt-2 text-sm opacity-90 max-w-lg">
              Track up to 20 items free, forever. No credit card, two minutes to set up.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2 mt-4">
              <Link to="/auth">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {page.sections.map((section) => (
          <section key={section.heading} className="mt-10">
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
        ))}

        <section className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {page.faqs.map((f) => (
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
            Keep exploring
          </h2>
          <div className="grid gap-3">
            {others.map((p) => (
              <Link
                key={p.slug}
                to={`/${p.slug}`}
                className="rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-elegant transition-all"
              >
                <p className="font-medium text-sm sm:text-base">{p.h1}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.tagline}</p>
              </Link>
            ))}
            <Link
              to="/guides"
              className="rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-elegant transition-all"
            >
              <p className="font-medium text-sm sm:text-base">Kitchen guides</p>
              <p className="text-xs text-muted-foreground mt-1">
                Practical guides to wasting less food at home.
              </p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/guides" className="hover:text-foreground transition-colors">Guides</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}

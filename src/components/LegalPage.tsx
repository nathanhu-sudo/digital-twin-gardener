import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";

type Section = { heading: string; body: ReactNode };

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: Section[] }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 glass sticky top-0 z-20">
        <div className="container max-w-3xl px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="font-serif font-bold text-lg ml-2">{title}</h1>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-10 pb-24">
        <div className="flex items-center gap-3 mb-2">
          <BrandLogo className="h-10 w-10 rounded-xl shadow" />
          <div>
            <h2 className="text-2xl font-bold font-serif tracking-tight">{title}</h2>
            <p className="text-xs text-muted-foreground">Last updated: {updated}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h3 className="font-semibold text-base text-foreground mb-2">{s.heading}</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{s.body}</div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

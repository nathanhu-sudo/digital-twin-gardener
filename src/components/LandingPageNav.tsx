import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/hooks/useAuth";

const pages = [
  { to: "/features", label: "What you get" },
  { to: "/how-it-works", label: "See it work" },
  { to: "/pricing", label: "Plans" },
];

export function LandingPageNav({ home = false }: { home?: boolean }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [railPosition, setRailPosition] = useState<{ x: number; y: number } | null>(null);
  const railRef = useRef<HTMLElement>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const showRail = !home || scrolled;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > (home ? 600 : 250));
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [home]);

  useEffect(() => {
    const keepVisible = () => {
      const rect = railRef.current?.getBoundingClientRect();
      if (!rect) return;
      setRailPosition(position => position && ({
        x: Math.max(0, Math.min(window.innerWidth - rect.width, position.x)),
        y: Math.max(0, Math.min(window.innerHeight - rect.height, position.y)),
      }));
    };
    window.addEventListener("resize", keepVisible);
    return () => window.removeEventListener("resize", keepVisible);
  }, []);

  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = railRef.current?.getBoundingClientRect();
    const offset = dragOffset.current;
    if (!rect || !offset) return;
    setRailPosition({
      x: Math.max(0, Math.min(window.innerWidth - rect.width, event.clientX - offset.x)),
      y: Math.max(0, Math.min(window.innerHeight - rect.height, event.clientY - offset.y)),
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 glass border-b border-border/40">
        <div className="container max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2"><BrandLogo showName className="h-9 w-9" nameClassName="text-lg" /></Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
            {pages.map(page => (
              <Link key={page.to} to={page.to} aria-current={pathname === page.to ? "page" : undefined}
                className={`hidden sm:inline-block text-sm transition-colors px-2 ${pathname === page.to ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {page.label}
              </Link>
            ))}
            {user ? <Button asChild size="sm"><Link to="/app">Open app</Link></Button> : <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
            </>}
          </nav>
        </div>
      </header>
      <nav aria-label="Explore pages" className="relative z-20 flex items-center justify-center gap-1 border-b border-border/40 bg-background/80 px-2 py-2 sm:hidden">
        {!home && (
          <Button asChild variant="ghost" size="sm" className="shrink-0 px-2 text-xs" aria-label="Back to home">
            <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
        )}
        {pages.map(page => <Button key={page.to} asChild variant={pathname === page.to ? "secondary" : "ghost"} size="sm" className="min-w-0 flex-1 px-1 text-xs">
          <Link to={page.to} aria-current={pathname === page.to ? "page" : undefined}>{page.label}</Link>
        </Button>)}
      </nav>
      {showRail && <nav ref={railRef} aria-label="Page navigation"
        className={`fixed z-40 hidden w-40 flex-col gap-1 rounded-2xl border border-landingNav-border bg-landingNav-surface/90 p-2 font-landingNav shadow-[0_8px_30px_hsl(var(--landing-nav-shadow))] backdrop-blur-xl md:flex animate-fade-in ${railPosition ? "" : "left-3 top-1/2 -translate-y-1/2"}`}
        style={railPosition ? { left: railPosition.x, top: railPosition.y } : undefined}>
        <div className="flex items-center justify-between pl-3">
          <span className="font-landingNavHeading text-xs font-semibold uppercase text-landingNav-ink">Menu</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-grab touch-none text-landingNav-ink/70 active:cursor-grabbing hover:bg-landingNav-border/40 hover:text-landingNav-ink" aria-label="Move page menu" title="Drag to move menu" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { dragOffset.current = null; }} onPointerCancel={() => { dragOffset.current = null; }}>
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
        {pages.map(page => (
          <Button key={page.to} asChild variant="ghost" size="sm" className={`h-9 justify-start gap-2 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-landingNav-border/40 hover:text-landingNav-ink ${pathname === page.to ? "text-landingNav-ink" : "text-landingNav-ink/70"}`}>
            <Link to={page.to} aria-current={pathname === page.to ? "page" : undefined}>
              <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${pathname === page.to ? "bg-landingNav-citrus" : "bg-transparent"}`} />
              {page.label}
            </Link>
          </Button>
        ))}
        <div className="mx-3 my-1 border-t border-landingNav-border/60" />
        {!home && (
          <Button asChild variant="ghost" size="sm" className="h-9 justify-between rounded-lg px-3 text-sm font-medium text-landingNav-ink hover:bg-landingNav-ink hover:text-primary-foreground">
            <Link to="/">Back to home <ArrowLeft className="h-4 w-4" /></Link>
          </Button>
        )}
        <Button asChild variant="ghost" size="sm" className="group h-9 justify-between rounded-lg px-3 text-sm font-medium text-landingNav-ink hover:bg-landingNav-ink hover:text-primary-foreground">
          <a href="#top">Back to top <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-1" /></a>
        </Button>
      </nav>}
      {scrolled && <Button asChild size="icon" className="fixed bottom-5 left-4 z-40 rounded-full bg-landingNav-ink text-primary-foreground shadow-elegant hover:bg-landingNav-ink/90 md:hidden" title="Back to top" aria-label="Back to top">
        <a href="#top"><ArrowUp className="h-5 w-5" /></a>
      </Button>}
    </>
  );
}

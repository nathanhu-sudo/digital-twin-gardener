import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingPageNav } from "@/components/LandingPageNav";
import { FeaturesContent, HowContent } from "@/components/LandingDetails";
import { useAuth } from "@/hooks/useAuth";

export default function LandingDetailPage({ kind }: { kind: "features" | "how" }) {
  const { user } = useAuth();
  const features = kind === "features";
  useEffect(() => {
    document.title = `${features ? "What you get" : "See it work"} | SmartPantry AI`;
    window.scrollTo(0, 0);
    return () => { document.title = "SmartPantry AI"; };
  }, [features]);
  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden bg-background bg-[url('/auth-bg.jpg')] bg-repeat [background-size:480px_480px]">
      <LandingPageNav />
      <main className="pt-8 sm:pt-12">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-serif">{features ? "What you get" : "See it work"}</h1>
        </div>
        {features ? <FeaturesContent /> : <HowContent />}
        <div className="container max-w-4xl mx-auto px-4 pb-20 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg"><Link to={user ? "/app" : "/auth"}>{user ? "Open your pantry" : "Get started free"}<ArrowRight className="h-4 w-4" /></Link></Button>
          <Button asChild variant="outline" size="lg"><Link to={features ? "/how-it-works" : "/features"}>{features ? "See it work" : "What you get"}</Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/pricing">Plans</Link></Button>
        </div>
      </main>
    </div>
  );
}

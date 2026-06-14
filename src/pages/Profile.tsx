import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfilePage from "@/pages/ProfilePage";

export default function Profile() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 bg-mesh pointer-events-none" aria-hidden="true" />
      <header className="border-b border-border/50 glass sticky top-0 z-20">
        <div className="container max-w-2xl px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="font-serif font-bold text-lg ml-2">Profile</h1>
        </div>
      </header>
      <main className="container max-w-2xl px-4 py-6 pb-24">
        <ProfilePage />
      </main>
    </div>
  );
}

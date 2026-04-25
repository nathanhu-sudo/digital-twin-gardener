import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { usePantryData } from "@/context/PantryDataContext";
import ProfilePage from "@/pages/ProfilePage";

export function ProfileDrawer() {
  const { profile } = usePantryData().profile;
  const { user } = useAuth();

  const initials = (profile?.display_name ?? user?.email ?? "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Open profile"
          className="rounded-full ring-2 ring-background hover:ring-primary/50 transition-shadow"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name ?? "Profile"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {initials || "🌱"}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif">Profile</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ProfilePage />
        </div>
      </SheetContent>
    </Sheet>
  );
}

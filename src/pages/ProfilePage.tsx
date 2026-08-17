import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Pencil, Check, X, Leaf, Trash2, Trophy, Flame, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

import { useAuth } from "@/hooks/useAuth";
import { usePantryData } from "@/context/PantryDataContext";
import { levelTitle, XP_PER_LEVEL } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const { gamification, challenges, profile: profileCtx } = usePantryData();
  const { profile, loading, saving, updateDisplayName, uploadAvatar } = profileCtx;
  const stats = gamification.stats;
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name);
  }, [profile?.display_name]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-card border rounded-2xl animate-pulse" />
        <div className="h-32 bg-card border rounded-2xl animate-pulse" />
      </div>
    );
  }

  const initials = (profile?.display_name ?? user?.email ?? "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadAvatar(f);
    e.target.value = "";
  };

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === profile?.display_name) { setEditing(false); return; }
    await updateDisplayName(trimmed);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Identity card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-6 flex flex-col items-center text-center gap-4"
      >
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name ?? "Avatar"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {initials || "🌱"}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={saving}
            aria-label="Change avatar"
            className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center shadow-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
        </div>

        {editing ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              autoFocus
              className="text-center"
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") { setName(profile?.display_name ?? ""); setEditing(false); }
              }}
            />
            <Button size="icon" variant="default" onClick={saveName} disabled={saving} aria-label="Save">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => { setName(profile?.display_name ?? ""); setEditing(false); }} aria-label="Cancel">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-2xl text-foreground">
                {profile?.display_name ?? "Eco Hero"}
              </h2>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)} aria-label="Edit name">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        )}

        {stats && (
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/30 px-3 py-1">
            <span className="text-xs font-medium text-primary">Level {stats.level}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-foreground">{levelTitle(stats.level)}</span>
          </div>
        )}
      </motion.div>

      {/* Stats summary */}
      {stats && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-foreground font-serif px-1">Your impact</h3>

          <div className="rounded-2xl border bg-card p-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" /> XP progress
              </span>
              <span className="text-xs font-medium text-foreground">
                {stats.xp % XP_PER_LEVEL}/{XP_PER_LEVEL}
              </span>
            </div>
            <Progress value={((stats.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-2">{stats.xp} XP total</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile
              icon={Leaf}
              color="text-primary"
              value={stats.kg_saved.toFixed(1)}
              unit="kg"
              label="Food saved"
            />
            <StatTile
              icon={Trophy}
              color="text-yellow-500"
              value={stats.items_consumed}
              label="Items consumed"
            />
            <StatTile
              icon={Flame}
              color="text-orange-500"
              value={challenges.weekStreak ?? 0}
              label="Week streak"
            />
            <StatTile
              icon={Flame}
              color="text-rose-500"
              value={stats.current_streak}
              label="Day streak"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile
              icon={Trash2}
              color="text-muted-foreground"
              value={stats.kg_wasted.toFixed(1)}
              unit="kg"
              label="Food wasted"
            />
            <StatTile
              icon={Trophy}
              color="text-amber-600"
              value={stats.longest_streak}
              label="Best day streak"
            />
          </div>
        </section>
      )}

      <NotificationSettings />
    </div>
  );
}

function NotificationSettings() {
  const { notifications } = usePantryData();
  const { prefs, updatePrefs } = notifications;

  return (
    <section className="rounded-2xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Expiry notifications</h2>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Label htmlFor="in-app-alerts" className="text-sm">In-app alerts</Label>
          <p className="text-[11px] text-muted-foreground">Bell alerts for items nearing expiry.</p>
        </div>
        <Switch
          id="in-app-alerts"
          checked={prefs.in_app_enabled}
          onCheckedChange={(v) => updatePrefs({ in_app_enabled: v })}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Label htmlFor="email-alerts" className="text-sm">Email reminders</Label>
          <p className="text-[11px] text-muted-foreground">A daily digest of what to use first.</p>
        </div>
        <Switch
          id="email-alerts"
          checked={prefs.email_enabled}
          onCheckedChange={(v) => updatePrefs({ email_enabled: v })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Warn me</Label>
          <span className="text-xs font-medium text-primary">
            {prefs.days_before} day{prefs.days_before !== 1 ? "s" : ""} before
          </span>
        </div>
        <Slider
          value={[prefs.days_before]}
          min={1}
          max={14}
          step={1}
          onValueChange={([v]) => updatePrefs({ days_before: v })}
        />
      </div>
    </section>
  );
}


function StatTile({
  icon: Icon,
  color,
  value,
  unit,
  label,
}: {
  icon: any;
  color: string;
  value: number | string;
  unit?: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 flex flex-col gap-1">
      <Icon className={cn("h-4 w-4", color)} />
      <p className="text-2xl font-bold text-foreground leading-tight">
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

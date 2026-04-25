import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    if (data) setProfile(data as Profile);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const updateDisplayName = useCallback(async (display_name: string) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error("Couldn't save name"); return; }
    setProfile((p) => (p ? { ...p, display_name } : p));
    toast.success("Profile updated");
  }, [user]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return;
    setSaving(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setSaving(false); toast.error("Upload failed"); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl;
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", user.id);
    setSaving(false);
    if (updErr) { toast.error("Couldn't save avatar"); return; }
    setProfile((p) => (p ? { ...p, avatar_url: url } : p));
    toast.success("Avatar updated");
  }, [user]);

  return { profile, loading, saving, refresh, updateDisplayName, uploadAvatar };
}

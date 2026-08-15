import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppNotification = {
  id: string;
  item_id: string | null;
  type: string;
  title: string;
  body: string;
  days_left: number | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationPrefs = {
  in_app_enabled: boolean;
  email_enabled: boolean;
  days_before: number;
};

const DEFAULT_PREFS: NotificationPrefs = {
  in_app_enabled: true,
  email_enabled: true,
  days_before: 3,
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef(false);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setPrefs(DEFAULT_PREFS);
      setLoading(false);
      return;
    }
    const [{ data: rows }, { data: prefRow }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id,item_id,type,title,body,days_left,read_at,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("notification_preferences")
        .select("in_app_enabled,email_enabled,days_before")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    setNotifications((rows ?? []) as AppNotification[]);
    if (prefRow) setPrefs(prefRow as NotificationPrefs);
    setLoading(false);
  }, [user]);

  // Generate fresh expiry alerts, then load them
  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.rpc("sync_expiry_notifications", { _user_id: user.id });
    } catch {
      /* non-fatal */
    }
    await fetchAll();
  }, [user, fetchAll]);

  useEffect(() => {
    if (!user) {
      syncedRef.current = false;
      setNotifications([]);
      setLoading(false);
      return;
    }
    if (syncedRef.current) return;
    syncedRef.current = true;
    setLoading(true);
    refresh();
  }, [user, refresh]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    },
    []
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", user.id)
      .is("read_at", null);
  }, [user]);

  const dismiss = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  }, []);

  const clearAll = useCallback(async () => {
    if (!user) return;
    setNotifications([]);
    await supabase.from("notifications").delete().eq("user_id", user.id);
  }, [user]);

  const updatePrefs = useCallback(
    async (patch: Partial<NotificationPrefs>) => {
      if (!user) return;
      const next = { ...prefs, ...patch };
      setPrefs(next);
      await supabase
        .from("notification_preferences")
        .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
      if (patch.days_before !== undefined || patch.in_app_enabled) {
        await refresh();
      }
    },
    [user, prefs, refresh]
  );

  return {
    notifications,
    unreadCount,
    prefs,
    loading,
    refresh,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
    updatePrefs,
  };
}

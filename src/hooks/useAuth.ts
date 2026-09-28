import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const GEO_KEY = "sp_geo_tracked_at";

function trackLocation() {
  try {
    const last = Number(localStorage.getItem(GEO_KEY) ?? 0);
    if (Date.now() - last < 6 * 60 * 60 * 1000) return;
    localStorage.setItem(GEO_KEY, String(Date.now()));
  } catch (_) { /* storage unavailable */ }
  let timezone = "";
  try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (_) { /* ignore */ }
  // Fire-and-forget; never surface failures (e.g. transient 503s) to the UI.
  void (async () => {
    try {
      const { error } = await supabase.functions.invoke("track-location", { body: { timezone } });
      if (error) {
        // Allow a retry sooner if the service was temporarily unavailable.
        try { localStorage.removeItem(GEO_KEY); } catch (_) { /* ignore */ }
      }
    } catch (_) {
      try { localStorage.removeItem(GEO_KEY); } catch (_) { /* ignore */ }
    }
  })();
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) setTimeout(trackLocation, 0);
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) setTimeout(trackLocation, 0);
    });

    return () => subscription.unsubscribe();
  }, []);


  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppNotification } from "@/hooks/useNotifications";

const STORAGE_KEY = "sp_device_alerts_enabled";
const SEEN_KEY = "sp_device_alerts_seen";

type PermissionState = "unsupported" | "default" | "granted" | "denied";

function readSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function writeSeen(ids: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids].slice(-200)));
  } catch {
    /* ignore */
  }
}

async function getRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/notify-sw.js");
  } catch {
    return null;
  }
}

export async function showDeviceNotification(title: string, body: string, tag?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const reg = await getRegistration();
  const options: NotificationOptions = {
    body,
    tag,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
  };
  if (reg && "showNotification" in reg) {
    await reg.showNotification(title, options);
    return;
  }
  try {
    new Notification(title, options);
  } catch {
    /* Android requires the service worker path */
  }
}

/**
 * Turns in-app expiry alerts into real system notifications
 * (Windows/macOS notification centre, Android/iOS home-screen app).
 */
export function useDeviceNotifications(notifications: AppNotification[]) {
  const supported =
    typeof window !== "undefined" && "Notification" in window;

  const [permission, setPermission] = useState<PermissionState>(
    supported ? (Notification.permission as PermissionState) : "unsupported"
  );
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1"
  );
  const seenRef = useRef<Set<string>>(readSeen());

  useEffect(() => {
    if (enabled && permission === "granted") void getRegistration();
  }, [enabled, permission]);

  const enable = useCallback(async () => {
    if (!supported) return "unsupported" as const;
    let result = Notification.permission as PermissionState;
    if (result === "default") {
      result = (await Notification.requestPermission()) as PermissionState;
    }
    setPermission(result);
    if (result === "granted") {
      setEnabled(true);
      localStorage.setItem(STORAGE_KEY, "1");
      await getRegistration();
      await showDeviceNotification(
        "Device alerts on",
        "We'll ping you here when food is about to expire.",
        "smartpantry-test"
      );
    }
    return result;
  }, [supported]);

  const disable = useCallback(() => {
    setEnabled(false);
    localStorage.setItem(STORAGE_KEY, "0");
  }, []);

  // Fire a system notification for each newly generated expiry alert.
  useEffect(() => {
    if (!enabled || permission !== "granted" || notifications.length === 0) return;
    const fresh = notifications.filter((n) => !n.read_at && !seenRef.current.has(n.id));
    if (fresh.length === 0) return;

    const toShow = fresh.slice(0, 3);
    toShow.forEach((n) => void showDeviceNotification(n.title, n.body, n.id));
    if (fresh.length > toShow.length) {
      void showDeviceNotification(
        "More items need eating",
        `${fresh.length - toShow.length} more items are close to expiring.`,
        "smartpantry-more"
      );
    }
    fresh.forEach((n) => seenRef.current.add(n.id));
    writeSeen(seenRef.current);
  }, [notifications, enabled, permission]);

  return { supported, permission, enabled, enable, disable };
}

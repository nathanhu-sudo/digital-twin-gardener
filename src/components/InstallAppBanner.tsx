import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "sp_install_dismissed";

/** Prompts visitors to add SmartPantry AI to their home screen. */
export function InstallAppBanner() {
  const [deferred, setDeferred] = useState<any>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const inIframe = window.self !== window.top;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    if (inIframe || standalone || localStorage.getItem(DISMISS_KEY)) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) { setIos(true); setShow(true); }
    const handler = (e: Event) => { e.preventDefault(); setDeferred(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;
  const dismiss = () => { localStorage.setItem(DISMISS_KEY, "1"); setShow(false); };

  return (
    <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 rounded-2xl border bg-card shadow-elegant p-4 flex items-start gap-3">
      <img src="/favicon.png" alt="" className="h-10 w-10 rounded-xl" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-foreground">Install SmartPantry AI</p>
        {ios ? (
          <p className="text-muted-foreground mt-0.5">
            Tap <Share className="inline h-3.5 w-3.5" /> Share, then "Add to Home Screen".
          </p>
        ) : (
          <>
            <p className="text-muted-foreground mt-0.5">Keep it one tap away at the fridge.</p>
            <Button size="sm" className="mt-2 gap-1" onClick={async () => { await deferred?.prompt(); dismiss(); }}>
              <Download className="h-3.5 w-3.5" /> Install app
            </Button>
          </>
        )}
      </div>
      <button onClick={dismiss} aria-label="Dismiss install prompt" className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

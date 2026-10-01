import { useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import type { NewPantryItem } from "@/hooks/usePantry";
import type { StorageLocation } from "@/types/pantry";

const HIGH = /beef|lamb|steak|mince|cheese|pork|bacon/;
const MEDIUM = /chicken|fish|salmon|milk|yogurt|yoghurt|butter|egg|bread|cream|ham/;

/** Parses phrases like "500 grams of chicken in the freezer" or "2 kg apples". */
export function parseSpokenItem(text: string): NewPantryItem | null {
  let t = text.toLowerCase().trim();
  let location: StorageLocation = "fridge";
  const loc = t.match(/\b(?:in|into|to)\s+(?:the\s+)?(fridge|freezer|pantry|cupboard)\b/);
  if (loc) { location = loc[1] === "cupboard" ? "pantry" : (loc[1] as StorageLocation); t = t.replace(loc[0], ""); }
  t = t.replace(/^(add|put)\s+/, "");
  let weightKg = 0.5;
  const w = t.match(/(\d+(?:\.\d+)?)\s*(kg|kilos?|kilograms?|g|grams?|l|litres?|liters?)\b/);
  if (w) {
    const n = parseFloat(w[1]);
    weightKg = /^(g|gram)/.test(w[2]) ? n / 1000 : n;
    t = t.replace(w[0], "");
  }
  const name = t.replace(/\b(of|a|an|some|the)\b/g, " ").replace(/\s+/g, " ").trim();
  if (!name) return null;
  const co2Impact = HIGH.test(name) ? "high" : MEDIUM.test(name) ? "medium" : "low";
  const shelfLifeDays = location === "freezer" ? 90 : location === "pantry" ? 60 : co2Impact === "high" ? 3 : co2Impact === "medium" ? 7 : 5;
  return { name: name.charAt(0).toUpperCase() + name.slice(1).slice(0, 60), weightKg: Math.max(0.01, Math.round(weightKg * 1000) / 1000), shelfLifeDays, co2Impact, location };
}

export function VoiceAddButton({ onAdd }: { onAdd: (item: NewPantryItem) => Promise<unknown> }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const SR = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

  const start = () => {
    if (!SR) { toast.error("Voice add isn't supported in this browser", { description: "Try Chrome, Edge or Safari." }); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = navigator.language || "en-NZ";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = async (e: any) => {
      const said = e.results[0][0].transcript as string;
      const parts = said.split(/\s+and\s+|,/).map((p) => parseSpokenItem(p)).filter(Boolean) as NewPantryItem[];
      if (!parts.length) { toast.error(`Didn't catch an item in "${said}"`); return; }
      for (const p of parts) await onAdd(p);
      toast.success(`Added ${parts.map((p) => p.name).join(", ")}`, { description: `Heard: "${said}"` });
    };
    rec.onerror = (e: any) => { if (e.error !== "aborted") toast.error("Voice add stopped", { description: e.error === "not-allowed" ? "Allow microphone access to use it." : undefined }); };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <Button type="button" variant={listening ? "default" : "outline"} onClick={start} className="gap-2 w-full">
      {listening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
      {listening ? "Listening… tap to stop" : "Add by voice — e.g. “500 g chicken in the freezer”"}
    </Button>
  );
}

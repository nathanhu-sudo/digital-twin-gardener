import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, Loader2, X, Check, Trash2, ScanText, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePantryData } from "@/context/PantryDataContext";

interface DetectedItem {
  name: string;
  weightKg: number;
  shelfLifeDays: number;
  co2Impact: "high" | "medium" | "low";
  confidence: number;
  selected: boolean;
}

export function OcrScanner() {
  const { pantry } = usePantryData();
  const { addItem } = pantry;
  const [analyzing, setAnalyzing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const [sourceType, setSourceType] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const downscaleImage = async (dataUrl: string, maxDim = 1280): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setDetected([]);
    setSourceType(null);
    try {
      const raw = await fileToBase64(file);
      const compressed = await downscaleImage(raw);
      setPreviewUrl(compressed);
      await analyze(compressed);
    } catch (e) {
      console.error(e);
      toast.error("Failed to read image");
    }
  };

  const analyze = async (imageBase64: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ocr-scan", {
        body: { imageBase64 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const items: DetectedItem[] = (data?.items ?? []).map((i: any) => ({
        ...i,
        selected: i.confidence >= 0.5,
      }));
      setSourceType(data?.sourceType ?? null);
      setDetected(items);
      if (items.length === 0) {
        toast.info("No food items detected. Try a clearer photo.");
      } else {
        toast.success(`Detected ${items.length} item${items.length === 1 ? "" : "s"}`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Scan failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggle = (idx: number) =>
    setDetected((prev) => prev.map((it, i) => (i === idx ? { ...it, selected: !it.selected } : it)));

  const remove = (idx: number) =>
    setDetected((prev) => prev.filter((_, i) => i !== idx));

  const reset = () => {
    setDetected([]);
    setPreviewUrl(null);
    setSourceType(null);
  };

  const addAll = async () => {
    const toAdd = detected.filter((d) => d.selected);
    if (toAdd.length === 0) {
      toast.error("Select at least one item");
      return;
    }
    setAdding(true);
    let success = 0;
    for (const it of toAdd) {
      const r = await addItem({
        name: it.name,
        weightKg: it.weightKg,
        shelfLifeDays: it.shelfLifeDays,
        co2Impact: it.co2Impact,
      });
      if (r) success++;
    }
    setAdding(false);
    toast.success(`Added ${success} item${success === 1 ? "" : "s"} to pantry`);
    reset();
  };

  const co2Color = (c: string) =>
    c === "high" ? "bg-destructive/15 text-destructive" : c === "medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success";

  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <ScanText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-serif leading-tight">Smart OCR Scan</h2>
            <p className="text-xs text-muted-foreground">Snap a receipt, fridge or pantry — AI extracts every item</p>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {!previewUrl && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => cameraRef.current?.click()}
            className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-6 flex flex-col items-center gap-2"
          >
            <div className="rounded-full bg-primary p-3 shadow-md">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">Take Photo</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-6 flex flex-col items-center gap-2"
          >
            <div className="rounded-full bg-primary p-3 shadow-md">
              <ImagePlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">Upload Image</span>
          </button>
        </div>
      )}

      {previewUrl && (
        <div className="relative rounded-xl overflow-hidden border">
          <img src={previewUrl} alt="Scan preview" className="w-full max-h-64 object-cover" />
          {analyzing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm font-medium">Reading items with AI vision…</p>
            </div>
          )}
          <button
            onClick={reset}
            className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5 hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
          {sourceType && !analyzing && (
            <Badge className="absolute top-2 left-2 bg-background/90 text-foreground capitalize">
              {sourceType}
            </Badge>
          )}
        </div>
      )}

      <AnimatePresence>
        {detected.length > 0 && !analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Detected items
              </p>
              <span className="text-xs text-muted-foreground">
                {detected.filter((d) => d.selected).length} of {detected.length} selected
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {detected.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                    item.selected ? "bg-primary/5 border-primary/30" : "bg-background"
                  }`}
                >
                  <button
                    onClick={() => toggle(idx)}
                    className={`shrink-0 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      item.selected ? "bg-primary border-primary" : "border-muted-foreground/30"
                    }`}
                  >
                    {item.selected && <Check className="h-4 w-4 text-primary-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] py-0">{item.weightKg}kg</Badge>
                      <Badge variant="secondary" className="text-[10px] py-0">{item.shelfLifeDays}d</Badge>
                      <Badge className={`text-[10px] py-0 ${co2Color(item.co2Impact)}`}>{item.co2Impact} CO₂</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {Math.round(item.confidence * 100)}% sure
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(idx)}
                    className="shrink-0 text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button onClick={addAll} disabled={adding} className="w-full gap-2">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Add {detected.filter((d) => d.selected).length} to Pantry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

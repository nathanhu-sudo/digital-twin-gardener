import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ScanLine, Sparkles, X, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePantry } from "@/hooks/usePantry";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Html5Qrcode } from "html5-qrcode";
import { OcrScanner } from "@/components/OcrScanner";

interface ProductResult {
  name: string;
  weightKg: number;
  shelfLifeDays: number;
  co2Impact: "high" | "medium" | "low";
  source: string;
  imageUrl?: string;
  brand?: string;
  categories?: string;
  originCountry?: string;
}

export default function ScannerPage() {
  const { scanItem, addItem } = usePantry();
  const [scanning, setScanning] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [foundProduct, setFoundProduct] = useState<ProductResult | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<string>("barcode-scanner-" + Math.random().toString(36).slice(2));

  const lookupBarcode = useCallback(async (barcode: string) => {
    setLookingUp(true);
    setFoundProduct(null);
    try {
      const { data, error } = await supabase.functions.invoke("barcode-lookup", {
        body: { barcode: barcode.trim() },
      });

      if (error || !data?.success) {
        toast.error("Product not found", {
          description: `Barcode ${barcode} not found in Open Food Facts or NZ databases. Try adding manually.`,
        });
        return null;
      }

      setFoundProduct(data.product);
      toast.success(`Found: ${data.product.name}`, {
        description: `Source: ${data.product.source}`,
      });
      return data.product as ProductResult;
    } catch {
      toast.error("Lookup failed. Please try again.");
      return null;
    } finally {
      setLookingUp(false);
    }
  }, []);

  const addFoundProduct = async () => {
    if (!foundProduct) return;
    await addItem({
      name: foundProduct.brand
        ? `${foundProduct.brand} ${foundProduct.name}`
        : foundProduct.name,
      weightKg: foundProduct.weightKg,
      shelfLifeDays: foundProduct.shelfLifeDays,
      co2Impact: foundProduct.co2Impact,
    });
    toast.success("Item added to pantry!");
    setFoundProduct(null);
    setManualBarcode("");
  };

  const openCamera = async () => {
    setCameraOpen(true);
    // Wait for DOM to render
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(scannerContainerRef.current);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            // Barcode detected
            console.log("Barcode detected:", decodedText);
            await closeCamera();
            await lookupBarcode(decodedText);
          },
          () => {
            // Scan failure - ignore, keep scanning
          }
        );
      } catch {
        toast.error("Camera access denied. Please allow camera permissions.");
        setCameraOpen(false);
      }
    }, 200);
  };

  const closeCamera = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current = null;
      }
    } catch {
      // Ignore cleanup errors
    }
    setCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  const handleManualLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    await lookupBarcode(manualBarcode.trim());
  };

  const quickScan = async () => {
    setScanning(true);
    try {
      const item = await scanItem();
      if (item) {
        toast.success(`Scanned: ${item.name}`, {
          description: `${item.weightKg} kg · ${item.shelfLifeDays} day shelf life`,
        });
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h2 className="text-xl font-serif font-bold text-foreground mb-1">Barcode Scanner</h2>
        <p className="text-sm text-muted-foreground">
          Scan barcodes to look up products from Open Food Facts & NZ databases
        </p>
      </div>

      {cameraOpen ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden bg-foreground"
        >
          <div
            id={scannerContainerRef.current}
            className="w-full min-h-[350px]"
          />
          <div className="absolute bottom-4 inset-x-0 flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 bg-card/80 backdrop-blur"
              onClick={closeCamera}
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Camera button */}
          <button
            onClick={openCamera}
            className="w-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-12 flex flex-col items-center gap-4"
          >
            <div className="rounded-full bg-primary p-5 shadow-lg">
              <Camera className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Scan Barcode</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Point your camera at a barcode
              </p>
            </div>
          </button>

          {/* Manual barcode input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or enter barcode</span>
            </div>
          </div>

          <form onSubmit={handleManualLookup} className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g. 9415767002104"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={lookingUp || !manualBarcode.trim()} className="gap-2">
              {lookingUp ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Look Up
            </Button>
          </form>

          {/* Quick scan demo */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 gap-2 text-base font-semibold animate-pulse-green"
            onClick={quickScan}
            disabled={scanning}
            type="button"
          >
            {scanning ? (
              <><Sparkles className="h-5 w-5 animate-spin" /> Scanning…</>
            ) : (
              <><ScanLine className="h-5 w-5" /> Quick AI Scan (Demo)</>
            )}
          </Button>
        </motion.div>
      )}

      {/* Found product card */}
      <AnimatePresence>
        {foundProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border bg-card p-5 flex flex-col gap-4"
          >
            <div className="flex items-start gap-4">
              {foundProduct.imageUrl && (
                <img
                  src={foundProduct.imageUrl}
                  alt={foundProduct.name}
                  className="w-16 h-16 rounded-xl object-cover bg-muted"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {foundProduct.brand && (
                    <span className="text-muted-foreground font-normal">{foundProduct.brand} </span>
                  )}
                  {foundProduct.name}
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {foundProduct.weightKg} kg
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                    {foundProduct.shelfLifeDays}d shelf life
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    foundProduct.co2Impact === 'high' ? 'bg-destructive/10 text-destructive' :
                    foundProduct.co2Impact === 'medium' ? 'bg-accent text-accent-foreground' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {foundProduct.co2Impact} CO₂
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Source: {foundProduct.source}
                  {foundProduct.originCountry && ` · ${foundProduct.originCountry}`}
                </p>
              </div>
            </div>

            <Button onClick={addFoundProduct} className="w-full gap-2" type="button">
              <ScanLine className="h-4 w-4" />
              Add to Pantry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="rounded-2xl bg-secondary/50 border p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-foreground">Scanning tips</p>
        <ul className="text-sm text-muted-foreground flex flex-col gap-2">
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> Point at the barcode on the packaging</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> Good lighting improves detection</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> NZ products are prioritised when found</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> You can also type the barcode number manually</li>
        </ul>
      </div>
    </div>
  );
}

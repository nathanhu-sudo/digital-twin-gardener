import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronDown, Shuffle, Snowflake, Refrigerator, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePantryData } from "@/context/PantryDataContext";

type Hack = {
  id: string;
  title: string;
  body: string;
  category: "storage" | "freezing" | "revive" | "waste";
  /** lowercase keywords matched against pantry item names */
  matches?: string[];
};

const CATEGORY_META: Record<Hack["category"], { label: string; icon: typeof Lightbulb }> = {
  storage: { label: "Storage", icon: Refrigerator },
  freezing: { label: "Freezing", icon: Snowflake },
  revive: { label: "Revive", icon: Sparkles },
  waste: { label: "Zero waste", icon: Lightbulb },
};

const HACKS: Hack[] = [
  {
    id: "herbs-jar",
    title: "Keep herbs alive twice as long",
    body: "Trim the stems and stand leafy herbs in a jar with 2cm of water, loose bag over the top, in the fridge door.",
    category: "storage",
    matches: ["herb", "coriander", "parsley", "basil", "mint"],
  },
  {
    id: "greens-towel",
    title: "Paper towel trick for greens",
    body: "Line the salad container with a dry paper towel. It absorbs condensation and stops spinach and lettuce going slimy.",
    category: "storage",
    matches: ["spinach", "lettuce", "salad", "rocket", "kale", "greens"],
  },
  {
    id: "bread-freeze",
    title: "Freeze bread in slices",
    body: "Freeze bread the day you buy it, sliced. Toast straight from frozen — no thawing, no mould, zero waste.",
    category: "freezing",
    matches: ["bread", "bagel", "bun", "loaf", "wrap"],
  },
  {
    id: "milk-back",
    title: "Milk belongs at the back",
    body: "The fridge door is the warmest spot. Storing milk on a back shelf can add 2-3 days of freshness.",
    category: "storage",
    matches: ["milk", "cream", "yoghurt", "yogurt"],
  },
  {
    id: "banana-stem",
    title: "Wrap banana stems",
    body: "Wrap the crown of a banana bunch in foil or cling film to slow ripening by several days.",
    category: "storage",
    matches: ["banana"],
  },
  {
    id: "limp-veg",
    title: "Revive limp vegetables",
    body: "Soak bendy carrots, celery or radish in ice water for 30 minutes. They rehydrate and snap back crisp.",
    category: "revive",
    matches: ["carrot", "celery", "radish", "cucumber"],
  },
  {
    id: "mince-portion",
    title: "Flat-pack your mince",
    body: "Freeze mince flat in a bag, pressed thin. It freezes fast, stacks neatly and defrosts in minutes.",
    category: "freezing",
    matches: ["mince", "beef", "chicken", "pork", "lamb", "meat"],
  },
  {
    id: "onion-potato",
    title: "Never store onions with potatoes",
    body: "Onions release moisture and gases that sprout potatoes. Keep them in separate dark, airy spots.",
    category: "storage",
    matches: ["onion", "potato"],
  },
  {
    id: "cheese-paper",
    title: "Let cheese breathe",
    body: "Swap plastic wrap for baking paper. Cheese keeps its texture instead of sweating and moulding early.",
    category: "storage",
    matches: ["cheese"],
  },
  {
    id: "scrap-stock",
    title: "Build a freezer stock bag",
    body: "Keep a bag in the freezer for onion ends, carrot peels and herb stems. When it's full, simmer it into stock.",
    category: "waste",
  },
  {
    id: "ice-cube-herbs",
    title: "Herb and oil ice cubes",
    body: "Chop leftover herbs into an ice cube tray with olive oil. Drop a cube straight into the pan later.",
    category: "waste",
  },
  {
    id: "eat-me-first",
    title: "Run an 'eat me first' shelf",
    body: "Give one shelf to anything within 3 days of expiry. You'll cook from it instinctively instead of forgetting.",
    category: "waste",
  },
  {
    id: "eggs-float",
    title: "The egg float test",
    body: "Drop an egg in water. Sinks flat = fresh, stands upright = use today, floats = bin it. Dates lie, physics doesn't.",
    category: "revive",
    matches: ["egg"],
  },
  {
    id: "fruit-separate",
    title: "Split ethylene fruit",
    body: "Apples, bananas and tomatoes release ethylene and ripen everything nearby. Store them away from your veg.",
    category: "storage",
    matches: ["apple", "banana", "tomato", "avocado", "pear"],
  },
];

function dayIndex(len: number) {
  const day = Math.floor(Date.now() / 86_400_000);
  return day % len;
}

export function KitchenHacks() {
  const { pantry } = usePantryData();
  const [expanded, setExpanded] = useState(false);
  const [shuffleOffset, setShuffleOffset] = useState(0);

  const names = useMemo(
    () => pantry.activeItems.map((i) => i.name.toLowerCase()),
    [pantry.activeItems]
  );

  // Hacks relevant to what's actually in the pantry come first
  const ordered = useMemo(() => {
    const relevant: Hack[] = [];
    const rest: Hack[] = [];
    for (const h of HACKS) {
      const hit = h.matches?.some((m) => names.some((n) => n.includes(m)));
      (hit ? relevant : rest).push(h);
    }
    return [...relevant, ...rest];
  }, [names]);

  const featured = ordered[(dayIndex(ordered.length) + shuffleOffset) % ordered.length];
  const others = ordered.filter((h) => h.id !== featured.id);
  const FeaturedIcon = CATEGORY_META[featured.category].icon;
  const isMatched = featured.matches?.some((m) => names.some((n) => n.includes(m)));

  return (
    <div className="rounded-2xl border border-border/60 glass p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="rounded-xl p-2 bg-primary/10 shrink-0">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold font-serif text-foreground leading-tight">Kitchen Hacks</h3>
            <p className="text-xs text-muted-foreground">Small tricks that keep food out of the bin</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShuffleOffset((o) => o + 1)}
          aria-label="Show another hack"
          className="text-muted-foreground shrink-0"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={featured.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="rounded-xl bg-secondary/50 border border-border/40 p-4"
        >
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <FeaturedIcon className="h-3 w-3" />
              {CATEGORY_META[featured.category].label}
            </Badge>
            {isMatched && (
              <Badge className="text-[11px] bg-primary/15 text-primary border-0 hover:bg-primary/15">
                Matches your pantry
              </Badge>
            )}
          </div>
          <p className="font-semibold text-foreground text-sm mb-1">{featured.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{featured.body}</p>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        {expanded ? "Show less" : `See all ${HACKS.length} hacks`}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden flex flex-col gap-2 mt-1"
          >
            {others.map((h) => {
              const Icon = CATEGORY_META[h.category].icon;
              return (
                <li key={h.id} className="rounded-xl border border-border/40 bg-card/60 p-3">
                  <div className="flex items-start gap-2.5">
                    <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{h.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{h.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

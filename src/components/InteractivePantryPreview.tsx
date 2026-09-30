import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Apple, BarChart2, ChefHat, Circle, CupSoda, Home, Leaf, Plus, ScanLine, Sparkles, Trophy, User, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const starterItems = [
  { id: 1, name: "Spinach", days: 3, icon: Leaf },
  { id: 2, name: "Milk", days: 1, icon: CupSoda },
  { id: 3, name: "Eggs", days: 5, icon: Circle },
];
type PantryItem = (typeof starterItems)[number];
type PreviewTab = "pantry" | "recipes" | "impact" | "profile";

export function InteractivePantryPreview() {
  const [tab, setTab] = useState<PreviewTab>("pantry");
  const [items, setItems] = useState<PantryItem[]>(starterItems);
  const [consumed, setConsumed] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState("3");
  const [recipe, setRecipe] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const urgent = useMemo(() => [...items].sort((a, b) => a.days - b.days)[0], [items]);
  const saved = (1.2 + consumed * 0.25).toFixed(2);

  const addItem = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems(current => [...current, { id: Date.now(), name: trimmed, days: Math.max(1, Math.min(30, Number(days) || 1)), icon: Apple }]);
    setName("");
    setDays("3");
    setAddOpen(false);
    setTab("pantry");
    setNotice(`${trimmed} added to your demo pantry`);
  };

  const eatItem = (item: PantryItem) => {
    setItems(current => current.filter(entry => entry.id !== item.id));
    setConsumed(current => current + 1);
    setSelectedItem(null);
    setNotice(`${item.name} used — your impact grew!`);
  };

  const reset = () => {
    setItems(starterItems);
    setConsumed(0);
    setRecipe(null);
    setSelectedItem(null);
    setAddOpen(false);
    setName("");
    setDays("3");
    setTab("pantry");
    setNotice("Demo pantry restored");
  };

  const nav: { key: PreviewTab; label: string; icon: typeof Home }[] = [
    { key: "pantry", label: "Pantry", icon: Home },
    { key: "recipes", label: "Recipes", icon: ChefHat },
    { key: "impact", label: "Impact", icon: BarChart2 },
    { key: "profile", label: "Profile", icon: User },
  ];

  return (
    <>
      <div className="relative">
        {/* Live-demo attention badge */}
        <div className="absolute -top-5 right-0 z-20 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-lg animate-bounce">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-foreground" />
          </span>
          Try the live demo
          <span className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-primary" aria-hidden="true" />
        </div>
        <div className="relative w-[540px] max-w-full h-[400px] bg-foreground rounded-[2.5rem] p-3 shadow-2xl border border-border/60 ring-8 ring-border/20">
        <div className="w-full h-full bg-background rounded-[1.8rem] overflow-hidden flex relative">
          {/* Tablet side rail */}
          <nav className="w-14 shrink-0 bg-card border-r border-border/50 flex flex-col items-center pt-4 pb-4" aria-label="Demo navigation">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30 mb-4" aria-hidden="true" />
            <div className="flex flex-col gap-2">
              {nav.map(entry => {
                const Icon = entry.icon;
                return <Button key={entry.key} type="button" variant="ghost" size="icon" aria-label={`Demo ${entry.label}`} aria-current={tab === entry.key ? "page" : undefined} title={entry.label} onClick={() => { setTab(entry.key); setNotice(""); }} className={`w-10 h-10 rounded-lg ${tab === entry.key ? "text-primary bg-primary/10" : "text-muted-foreground"}`}><Icon className="h-5 w-5" /></Button>;
              })}
            </div>
          </nav>

          {/* Main area */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="px-5 pt-3 pb-2 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-bold text-foreground">{tab === "pantry" ? "My Pantry" : tab === "recipes" ? "Recipes" : tab === "impact" ? "My Impact" : "My Profile"}</h2>
                <p className="text-[10px] text-primary font-semibold">Interactive demo · sample data</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button type="button" variant="ghost" size="icon" aria-label="Reset demo pantry" title="Reset demo pantry" onClick={reset} className="rounded-full h-9 w-9 bg-secondary text-primary hover:bg-primary/10 hover:text-primary">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" aria-label="Add a pantry item" title="Add a pantry item" onClick={() => setAddOpen(true)} className="rounded-full h-9 w-9 shadow-lg">
                  <ScanLine className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3 pt-1 md:grid md:grid-cols-5 md:gap-4" aria-live="polite">
              {notice && <div role="status" className="md:col-span-5 text-[10px] text-primary font-semibold px-1">{notice}</div>}
              {/* Primary column */}
              <div className="md:col-span-3 space-y-3 py-2">
                {tab === "pantry" && <>
                  <div className="flex justify-between items-center px-1"><h3 className="text-[10px] font-bold text-muted-foreground uppercase">Items · {items.length}</h3><span className="text-[10px] text-muted-foreground">Tap to use</span></div>
                  {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">All used up! Add an item to keep going.</p>}
                  {items.map(item => {
                    const Icon = item.icon;
                    return <Button key={item.id} type="button" variant="outline" onClick={() => setSelectedItem(item.id)} className="w-full h-auto min-h-12 px-3 py-2 justify-between text-left bg-card whitespace-normal rounded-lg">
                      <span className="flex items-center gap-2 min-w-0"><span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-primary" /></span><span className="min-w-0"><span className="block text-xs font-bold truncate">{item.name}</span><span className="block text-[10px] text-muted-foreground">{item.days === 1 ? "Expiring tomorrow" : `Fresh for ${item.days} days`}</span></span></span>
                      <span className={`text-[9px] font-semibold shrink-0 ${item.days <= 1 ? "text-warning" : "text-success"}`}>{item.days <= 1 ? "Use soon" : "Fresh"}</span>
                    </Button>;
                  })}
                  {selectedItem !== null && (() => {
                    const item = items.find(entry => entry.id === selectedItem);
                    return item ? <div className="bg-secondary rounded-lg p-3 flex items-center justify-between gap-2"><span className="text-xs font-medium">Used {item.name}?</span><Button type="button" size="sm" className="h-7 text-xs" onClick={() => eatItem(item)}><Check /> Mark used</Button></div> : null;
                  })()}
                </>}
                {tab === "recipes" && <>
                  <p className="text-xs text-muted-foreground">Ideas from your demo pantry</p>
                  {items.length === 0 ? <p className="text-xs text-muted-foreground py-6">Add an item to see a recipe idea.</p> : <>
                    <div className="rounded-lg bg-secondary p-3 space-y-2">
                      <span className="text-[10px] uppercase text-primary font-bold">Use first · {urgent.name}</span>
                      <h3 className="text-sm font-bold">{urgent.name} kitchen bowl</h3>
                      <p className="text-[11px] text-muted-foreground">A quick idea using {items.slice(0, 3).map(item => item.name.toLowerCase()).join(", ")}.</p>
                      <Button type="button" size="sm" className="h-8 text-xs" onClick={() => setRecipe(`${urgent.name} kitchen bowl`)}><Sparkles /> See idea</Button>
                    </div>
                    {recipe && <div className="bg-card border border-border rounded-lg p-3 space-y-1 text-xs"><p className="font-bold">{recipe}</p><p>Cook the ingredients you have, season to taste, and serve warm. Check that everything is fresh before cooking.</p><p className="text-muted-foreground text-[10px]">Sample idea, not AI-generated</p></div>}
                  </>}
                </>}
                {tab === "impact" && <>
                  <div className="rounded-lg bg-primary text-primary-foreground p-4"><Leaf className="h-5 w-5 mb-2" /><p className="text-2xl font-bold">{saved} kg</p><p className="text-xs">Food saved in this demo</p></div>
                  <div className="grid grid-cols-2 gap-2"><div className="bg-card border border-border rounded-lg p-3"><p className="text-lg font-bold">{consumed}</p><p className="text-[10px] text-muted-foreground">Items consumed</p></div><div className="bg-card border border-border rounded-lg p-3"><p className="text-lg font-bold">{Math.min(consumed, 2)}/2</p><p className="text-[10px] text-muted-foreground">Challenge progress</p></div></div>
                  <p className="text-[11px] text-muted-foreground">Mark pantry items as used to see these numbers grow.</p>
                </>}
                {tab === "profile" && <>
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"><span className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"><User className="h-5 w-5 text-primary" /></span><div><p className="text-sm font-bold">Demo Explorer</p><p className="text-[10px] text-muted-foreground">Sample profile</p></div></div>
                  <p className="text-xs text-muted-foreground">Your real pantry, progress and rewards are saved when you create an account.</p>
                  <Button asChild size="sm" className="w-full text-xs"><Link to="/auth?mode=signup">Create free account</Link></Button>
                  <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={reset}><RotateCcw /> Reset demo</Button>
                </>}
              </div>
              {/* Side panel */}
              <div className="md:col-span-2 space-y-3 py-2">
                <div className="p-3 rounded-lg bg-primary text-primary-foreground shadow-md">
                  <p className="text-[9px] opacity-80 uppercase font-bold">Weekly Impact</p>
                  <p className="text-sm font-semibold">{saved} kg food saved</p>
                  <p className="text-[10px] opacity-90">{consumed} items used in this demo</p>
                </div>
                <div className="bg-card border border-border p-3 rounded-lg flex items-center gap-3">
                  <div className="w-9 h-9 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center"><Trophy className="h-5 w-5 text-primary" /></div>
                  <div><p className="text-[10px] text-muted-foreground">Weekly Challenge</p><p className="text-xs font-bold">Use {Math.max(0, 2 - consumed)} more items</p></div>
                </div>
                <div className={`rounded-lg border p-3 space-y-2 ${consumed > 0 || items.length > starterItems.length ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                  <p className="text-xs font-bold">{consumed > 0 || items.length > starterItems.length ? "Like it? Keep it for real." : "Ready for your own pantry?"}</p>
                  <p className="text-[10px] text-muted-foreground">Create a free account to save items and progress.</p>
                  <Button asChild size="sm" className="h-7 w-full text-xs"><Link to="/auth?mode=signup">Create free account</Link></Button>
                </div>
              </div>
            </div>
          </div>

          <Button type="button" size="icon" aria-label="Add a pantry item" title="Add a pantry item" onClick={() => setAddOpen(true)} className="absolute bottom-4 right-4 w-10 h-10 rounded-full shadow-lg ring-4 ring-background">
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25 pointer-events-none" aria-hidden="true" />
            <Plus className="relative h-5 w-5" />
          </Button>
          {/* Floating tap hotspot near the add button */}
          <div className="pointer-events-none absolute bottom-14 right-3.5 z-20 flex flex-col items-end animate-bounce" aria-hidden="true">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 border border-primary/40 backdrop-blur-sm shadow-lg">
              <span className="h-3.5 w-3.5 rounded-full bg-primary animate-pulse" />
            </span>
            <span className="mt-1.5 rounded-md bg-foreground px-2 py-1 text-[9px] font-semibold text-background shadow-lg">
              Click to add an item
            </span>
          </div>
        </div>
      </div>
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader><DialogTitle>Add a demo item</DialogTitle><DialogDescription>This is sample data and won't be saved to an account.</DialogDescription></DialogHeader>
          <form onSubmit={addItem} className="space-y-4">
            <label className="block text-sm font-medium" htmlFor="demo-item">Item name</label>
            <Input id="demo-item" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tomatoes" maxLength={40} required />
            <label className="block text-sm font-medium" htmlFor="demo-days">Days until expiry</label>
            <Input id="demo-days" type="number" min="1" max="30" value={days} onChange={e => setDays(e.target.value)} required />
            <Button type="submit" className="w-full">Add item</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

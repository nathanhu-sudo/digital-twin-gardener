import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X, Bot, Loader2, Wand2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePantryData } from "@/context/PantryDataContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "What's expiring this week?",
  "Plan tonight's dinner",
  "Generate a shopping list",
  "How am I doing on waste?",
];

export function PantryChatDrawer() {
  const { pantry, gamification, challenges } = usePantryData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const buildContext = useCallback(() => {
    const items = pantry.activeItems.map((i) => ({
      name: i.name,
      weightKg: i.weightKg,
      daysRemaining: pantry.getDaysRemaining(i),
      co2Impact: i.co2Impact,
    }));
    const stats = gamification.stats;
    return {
      pantryItems: items,
      totalActiveItems: items.length,
      expiringSoon: items.filter((i) => i.daysRemaining <= 3),
      impact: pantry.impact,
      stats: stats
        ? {
            level: stats.level,
            xp: stats.xp,
            currentStreak: stats.current_streak,
            kgSaved: Number(stats.kg_saved),
            kgWasted: Number(stats.kg_wasted),
            itemsConsumed: stats.items_consumed,
            itemsTossed: stats.items_tossed,
          }
        : null,
      weekStreak: challenges.weekStreak ?? 0,
    };
  }, [pantry, gamification.stats, challenges.weekStreak]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pantry-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next,
          pantryContext: buildContext(),
        }),
      });

      if (resp.status === 429) {
        toast.error("Rate limit hit — please wait a moment.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Add credits in workspace settings.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, nl);
          textBuffer = textBuffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Chat failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open AI assistant"
          className="fixed z-40 bottom-24 sm:bottom-6 right-4 sm:right-6 h-14 w-14 rounded-full glow animate-glow-pulse flex items-center justify-center text-primary-foreground shadow-lg hover-lift transition-transform"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Bot className="h-6 w-6" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 glass-strong border-l border-border/40 flex flex-col"
      >
        <header className="flex items-center justify-between gap-3 p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div
              className="rounded-xl p-2 glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Wand2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-foreground font-serif leading-tight">Pantry Assistant</h2>
              <p className="text-[11px] text-muted-foreground">Knows what's in your kitchen</p>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex flex-col gap-4 mt-4">
              <div className="text-center flex flex-col items-center gap-2">
                <div className="rounded-2xl p-3 glow animate-float" style={{ background: "var(--gradient-primary)" }}>
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Ask me anything about your pantry — recipes, expiring items, meal plans, or sustainability tips.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-left text-sm rounded-xl border border-border/40 glass px-3 py-2.5 hover:bg-primary/5 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === "user"
                      ? "text-primary-foreground"
                      : "glass border border-border/40 text-foreground"
                  }`}
                  style={
                    m.role === "user"
                      ? { background: "var(--gradient-primary)" }
                      : undefined
                  }
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-foreground">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="glass border border-border/40 rounded-2xl px-3.5 py-2.5 text-sm flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="text-muted-foreground">Thinking…</span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-3 border-t border-border/40 flex gap-2"
        >
          <Input
            placeholder="Ask anything about your pantry…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 glass border-border/40"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

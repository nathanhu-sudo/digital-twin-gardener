import { useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Check, X, Users, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFriends, type MemberSearchRow } from "@/hooks/useFriends";

function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export function FriendsPanel({ onChanged }: { onChanged?: () => void }) {
  const { friends, incoming, outgoing, loading, search, sendRequest, accept, remove } = useFriends();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberSearchRow[]>([]);
  const [searching, setSearching] = useState(false);

  const runSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    setResults(await search(q));
    setSearching(false);
  };

  const after = async (fn: Promise<void> | void) => {
    await fn;
    onChanged?.();
    if (query.trim().length >= 2) setResults(await search(query));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="rounded-xl border bg-card p-3 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => runSearch(e.target.value)}
            placeholder="Find friends by display name…"
            className="pl-9 text-base"
          />
        </div>

        {query.trim().length >= 2 && (
          <div className="flex flex-col gap-2">
            {searching ? (
              <p className="text-xs text-muted-foreground px-1">Searching…</p>
            ) : results.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1">No members found.</p>
            ) : (
              results.map((r) => (
                <Row
                  key={r.user_id}
                  name={r.display_name}
                  avatar={r.avatar_url}
                  action={
                    r.relation === "none" ? (
                      <Button size="sm" variant="secondary" onClick={() => after(sendRequest(r.user_id))}>
                        <UserPlus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground capitalize">
                        {r.relation === "friend" ? "Friends" : r.relation === "outgoing" ? "Requested" : "Wants to add you"}
                      </span>
                    )
                  }
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <Section title="Requests" icon={Clock} count={incoming.length}>
          {incoming.map((f) => (
            <Row
              key={f.friendship_id}
              name={f.display_name}
              avatar={f.avatar_url}
              action={
                <div className="flex gap-1.5">
                  <Button size="sm" onClick={() => after(accept(f.friendship_id))}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => after(remove(f.friendship_id))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
          ))}
        </Section>
      )}

      {/* Friends */}
      <Section title="Friends" icon={Users} count={friends.length}>
        {loading ? (
          <div className="h-14 rounded-lg border bg-card animate-pulse" />
        ) : friends.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No friends yet — search above to connect and compare your impact.
          </p>
        ) : (
          friends.map((f) => (
            <Row
              key={f.friendship_id}
              name={f.display_name}
              avatar={f.avatar_url}
              action={
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => after(remove(f.friendship_id))}>
                  Remove
                </Button>
              }
            />
          ))
        )}
      </Section>

      {outgoing.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {outgoing.length} pending request{outgoing.length !== 1 ? "s" : ""} sent
        </p>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, count, children }: { title: string; icon: any; count: number; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
      {children}
    </div>
  );
}

function Row({ name, avatar, action }: { name: string; avatar: string | null; action: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl border bg-card p-3"
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={avatar ?? undefined} alt={name} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials(name) || "🌱"}</AvatarFallback>
      </Avatar>
      <p className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">{name}</p>
      {action}
    </motion.div>
  );
}

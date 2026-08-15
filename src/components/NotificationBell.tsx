import { Bell, X, AlertTriangle, Clock, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { usePantryData } from "@/context/PantryDataContext";

export function NotificationBell() {
  const { notifications: n } = usePantryData();
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll } = n;

  return (
    <Popover onOpenChange={(open) => open && unreadCount > 0 && setTimeout(markAllRead, 1200)}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[320px] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold">Expiry alerts</p>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="h-6 w-6 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">
              Nothing expiring soon. We'll tell you when something needs eating.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[340px]">
            <ul className="divide-y">
              <AnimatePresence initial={false}>
                {notifications.map((item) => {
                  const overdue = (item.days_left ?? 0) < 0;
                  const urgent = (item.days_left ?? 99) <= 1;
                  const Icon = overdue ? AlertTriangle : Clock;
                  return (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={() => !item.read_at && markRead(item.id)}
                      className={cn(
                        "flex gap-3 px-4 py-3 group",
                        !item.read_at && "bg-primary/5"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 mt-0.5",
                          overdue ? "text-destructive" : urgent ? "text-warning" : "text-primary"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground leading-snug break-words">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 break-words">
                          {item.body}
                        </p>
                      </div>
                      <button
                        aria-label="Dismiss"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismiss(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  showName?: boolean;
  nameClassName?: string;
}

export function BrandLogo({ className, showName = false, nameClassName }: BrandLogoProps) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      <img
        src="/favicon.png"
        alt="SmartPantry AI logo"
        className={cn("h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm", className)}
      />
      {showName && (
        <span className={cn("font-serif font-bold text-foreground", nameClassName)}>
          SmartPantry AI
        </span>
      )}
    </span>
  );
}
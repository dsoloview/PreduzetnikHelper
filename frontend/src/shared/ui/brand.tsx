import { cn } from "@/shared/lib/utils";

/** Logo mark and wordmark */
export const Brand = ({ className }: { className?: string }) => (
  <span className={cn("flex items-center gap-2", className)}>
    <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
      P
    </span>
    <span className="text-base font-semibold tracking-tight">Preduzetnik</span>
  </span>
);

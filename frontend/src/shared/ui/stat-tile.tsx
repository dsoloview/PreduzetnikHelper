import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

type Tone = "default" | "success" | "info" | "warning" | "danger";

const TONE_ICON: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success-soft text-success-strong",
  info: "bg-info-soft text-info-strong",
  warning: "bg-warning-soft text-warning-strong",
  danger: "bg-destructive-soft text-destructive-strong",
};

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  isLoading?: boolean;
}

/** A headline number with its label; the tone colors only the icon, so the figures stay calm */
export const StatTile = ({ label, value, hint, icon: Icon, tone = "default", isLoading }: StatTileProps) => (
  <Card className="gap-0 p-3 sm:p-4">
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      <span className={cn("hidden size-7 shrink-0 items-center justify-center rounded-md sm:flex", TONE_ICON[tone])}>
        <Icon className="size-4" />
      </span>
    </div>
    <div className="mt-1.5 text-base font-semibold tracking-tight sm:mt-2 sm:text-2xl">
      {isLoading ? <Skeleton className="h-7 w-32" /> : value}
    </div>
    {hint && <div className="mt-1 text-xs text-muted-foreground">{isLoading ? <Skeleton className="h-3 w-20" /> : hint}</div>}
  </Card>
);

import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import type { ILimitStatus } from "@preduzetnik/shared";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/card";
import { Money } from "@/shared/ui/money";
import { getLimitLevel, type LimitLevel } from "../lib/limit-level";

const LEVEL_STYLE: Record<LimitLevel, { bar: string; text: string }> = {
  ok: { bar: "bg-primary", text: "text-foreground" },
  warning: { bar: "bg-warning", text: "text-warning-strong" },
  danger: { bar: "bg-destructive", text: "text-destructive-strong" },
};

interface LimitCardProps {
  title: string;
  description?: string;
  status: ILimitStatus;
  compact?: boolean;
}

export const LimitCard = ({ title, description, status, compact = false }: LimitCardProps) => {
  const { t } = useTranslation();
  const level = getLimitLevel(status);
  const style = LEVEL_STYLE[level];

  return (
    <Card className={cn("gap-0", compact ? "p-4" : "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={cn("font-medium", compact ? "text-sm text-muted-foreground" : "text-base")}>{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <span className={cn("shrink-0 text-lg font-semibold", style.text)}>{status.percentage.toFixed(1)}%</span>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={title}
        aria-valuenow={Math.round(status.percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn("h-full rounded-full transition-all", style.bar)} style={{ width: `${Math.min(status.percentage, 100)}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">
          <Money amount={status.current} currency="RSD" className="font-medium text-foreground" />
          {" / "}
          <Money amount={status.limit} currency="RSD" />
        </span>
        <span className="text-muted-foreground">
          {t("limits.remaining")}: <Money amount={status.remaining} currency="RSD" className={cn("font-medium", style.text)} />
        </span>
      </div>

      {level !== "ok" && (
        <p className={cn("mt-3 flex items-center gap-1.5 text-xs font-medium", style.text)}>
          <AlertTriangle className="size-3.5" />
          {status.isExceeded ? t("limits.exceeded") : t("limits.approaching")}
        </p>
      )}
    </Card>
  );
};

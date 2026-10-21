import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import type { TaxMonthStatus } from "../lib/tax-status";

const STATUS_STYLE: Record<TaxMonthStatus, { pill: string; dot: string }> = {
  paid: { pill: "bg-success-soft text-success-strong", dot: "bg-success" },
  overdue: { pill: "bg-destructive-soft text-destructive-strong", dot: "bg-destructive" },
  dueSoon: { pill: "bg-warning-soft text-warning-strong", dot: "bg-warning" },
  upcoming: { pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" },
};

interface TaxMonthStatusBadgeProps {
  status: TaxMonthStatus;
  className?: string;
}

export const TaxMonthStatusBadge = ({ status, className }: TaxMonthStatusBadgeProps) => {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        style.pill,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden="true" />
      {t(`taxes.status.${status}`)}
    </span>
  );
};

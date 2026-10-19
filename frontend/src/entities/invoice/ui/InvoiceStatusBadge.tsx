import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import type { InvoiceDisplayStatus } from "../lib/display-status";

interface InvoiceStatusBadgeProps {
  status: InvoiceDisplayStatus;
  className?: string;
}

/** Soft colored pills: only OVERDUE is loud, PAID is calm, DRAFT and CANCELLED stay neutral */
const STATUS_STYLE: Record<InvoiceDisplayStatus, { pill: string; dot: string }> = {
  DRAFT: { pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" },
  SENT: { pill: "bg-info-soft text-info-strong", dot: "bg-info" },
  OVERDUE: { pill: "bg-destructive-soft text-destructive-strong", dot: "bg-destructive" },
  PAID: { pill: "bg-success-soft text-success-strong", dot: "bg-success" },
  CANCELLED: { pill: "bg-muted text-muted-foreground line-through decoration-muted-foreground/50", dot: "bg-muted-foreground/40" },
};

export const InvoiceStatusBadge = ({ status, className }: InvoiceStatusBadgeProps) => {
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
      {t(`invoices.status.${status.toLowerCase()}`)}
    </span>
  );
};

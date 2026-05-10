import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { IInvoiceResponse } from "@preduzetnik/shared";

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-500",
  SENT: "bg-blue-500",
  DRAFT: "bg-gray-400",
  CANCELLED: "bg-red-400",
};

interface InvoiceStatusBreakdownProps {
  invoices: IInvoiceResponse[];
}

export const InvoiceStatusBreakdown = ({ invoices }: InvoiceStatusBreakdownProps) => {
  const { t } = useTranslation();

  if (invoices.length === 0) return null;

  const counts: Record<string, number> = { PAID: 0, SENT: 0, DRAFT: 0, CANCELLED: 0 };
  for (const inv of invoices) counts[inv.status] = (counts[inv.status] ?? 0) + 1;
  const total = invoices.length;
  const segments = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ status, count, pct: (count / total) * 100 }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("dashboard.breakdown.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex rounded-full overflow-hidden h-3">
          {segments.map(({ status, pct }) => (
            <div
              key={status}
              className={cn(STATUS_COLORS[status] ?? "bg-gray-300")}
              style={{ width: `${pct}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {segments.map(({ status, count, pct }) => (
            <div key={status} className="flex items-center gap-2 text-sm">
              <div className={cn("size-2.5 rounded-full", STATUS_COLORS[status] ?? "bg-gray-300")} />
              <span className="text-muted-foreground">
                {t(`invoices.status.${status.toLowerCase()}`)}
              </span>
              <span className="font-medium">{count}</span>
              <span className="text-muted-foreground">({pct.toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

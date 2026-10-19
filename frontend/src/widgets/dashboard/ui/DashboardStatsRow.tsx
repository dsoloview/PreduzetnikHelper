import { useTranslation } from "react-i18next";
import { Wallet, Clock, AlertCircle, Gauge } from "lucide-react";
import type { ILimitsResponse } from "@preduzetnik/shared";

import { StatTile } from "@/shared/ui/stat-tile";
import { Money } from "@/shared/ui/money";
import type { InvoiceSummary } from "@/entities/invoice/lib/summary";
import { getLimitLevel } from "@/entities/limits/lib/limit-level";

interface DashboardStatsRowProps {
  summary: InvoiceSummary;
  limits: ILimitsResponse | undefined;
  isLoading: boolean;
}

/** The four questions a paušalac asks: what came in, what is coming, what is late, how much room is left */
export const DashboardStatsRow = ({ summary, limits, isLoading }: DashboardStatsRowProps) => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const pausal = limits?.pausalLimit;
  const pausalLevel = pausal ? getLimitLevel(pausal) : "ok";

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatTile
        label={t("dashboard.stats.received", { year })}
        value={<Money amount={summary.received.totalRsd} currency="RSD" />}
        hint={t("dashboard.stats.invoiceCount", { count: summary.received.count })}
        icon={Wallet}
        tone="success"
        isLoading={isLoading}
      />
      <StatTile
        label={t("dashboard.stats.expected")}
        value={<Money amount={summary.expected.totalRsd} currency="RSD" />}
        hint={t("dashboard.stats.invoiceCount", { count: summary.expected.count })}
        icon={Clock}
        tone="info"
        isLoading={isLoading}
      />
      <StatTile
        label={t("dashboard.stats.overdue")}
        value={
          <Money
            amount={summary.overdue.totalRsd}
            currency="RSD"
            className={summary.overdue.count > 0 ? "text-destructive-strong" : undefined}
          />
        }
        hint={t("dashboard.stats.invoiceCount", { count: summary.overdue.count })}
        icon={AlertCircle}
        tone={summary.overdue.count > 0 ? "danger" : "default"}
        isLoading={isLoading}
      />
      <StatTile
        label={t("dashboard.stats.headroom")}
        value={
          pausal ? (
            <Money
              amount={pausal.remaining}
              currency="RSD"
              className={pausalLevel === "warning" ? "text-warning-strong" : pausalLevel === "danger" ? "text-destructive-strong" : undefined}
            />
          ) : "—"
        }
        hint={pausal ? t("dashboard.stats.headroomHint", { percent: pausal.percentage.toFixed(1) }) : undefined}
        icon={Gauge}
        tone={pausalLevel === "ok" ? "default" : pausalLevel === "warning" ? "warning" : "danger"}
        isLoading={isLoading || !limits}
      />
    </div>
  );
};

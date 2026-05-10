import { useTranslation } from "react-i18next";
import { TrendingUp, CheckCircle, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import type { IInvoiceResponse } from "@preduzetnik/shared";

interface DashboardStatsRowProps {
  invoices: IInvoiceResponse[] | undefined;
  isLoading: boolean;
}

export const DashboardStatsRow = ({ invoices, isLoading }: DashboardStatsRowProps) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const stats = (() => {
    if (!invoices) return null;
    const thisYear = invoices.filter((inv) => inv.year === currentYear);
    const totalRsd = thisYear
      .filter((inv) => inv.status === "PAID" || inv.status === "SENT")
      .reduce((sum, inv) => sum + inv.totalRsd, 0);
    const paid = invoices.filter((inv) => inv.status === "PAID").length;
    const pending = invoices.filter((inv) => inv.status === "DRAFT" || inv.status === "SENT").length;
    const uniqueClients = new Set(invoices.map((inv) => inv.clientId)).size;
    return { totalRsd, paid, pending, uniqueClients };
  })();

  const items = [
    {
      label: t("dashboard.stats.revenue"),
      value: isLoading
        ? "..."
        : `${(stats?.totalRsd ?? 0).toLocaleString("sr-RS", { maximumFractionDigits: 0 })} RSD`,
      icon: TrendingUp,
      sub: t("dashboard.stats.revenueSub", { year: currentYear }),
    },
    {
      label: t("dashboard.stats.paid"),
      value: isLoading ? "..." : String(stats?.paid ?? 0),
      icon: CheckCircle,
      sub: t("dashboard.stats.invoices"),
    },
    {
      label: t("dashboard.stats.pending"),
      value: isLoading ? "..." : String(stats?.pending ?? 0),
      icon: Clock,
      sub: t("dashboard.stats.invoices"),
    },
    {
      label: t("dashboard.stats.clients"),
      value: isLoading ? "..." : String(stats?.uniqueClients ?? 0),
      icon: Users,
      sub: t("dashboard.stats.unique"),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, sub }) => (
        <Card key={label}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
              <Icon className="size-5 text-muted-foreground mt-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

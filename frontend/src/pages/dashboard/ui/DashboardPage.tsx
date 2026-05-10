import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLimits } from "@/entities/limits/api/limits.queries";
import { useInvoices } from "@/entities/invoice/api/invoice.queries";
import { LimitCard } from "@/entities/limits/ui/LimitCard";
import { Button } from "@/shared/ui/button";
import { ArrowRight } from "lucide-react";
import { DashboardStatsRow } from "@/widgets/dashboard/ui/DashboardStatsRow";
import { InvoiceStatusBreakdown } from "@/entities/invoice/ui/InvoiceStatusBreakdown";
import { RecentInvoicesList } from "@/entities/invoice/ui/RecentInvoicesList";
import { TopClientsList } from "@/entities/client/ui/TopClientsList";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { data: limits, isLoading: limitsLoading } = useLimits();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      <DashboardStatsRow invoices={invoices} isLoading={invoicesLoading} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("dashboard.limits.title")}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/limits" className="flex items-center gap-1 text-sm">
              {t("dashboard.limits.viewAll")} <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        {limitsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : limits ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LimitCard title={t("limits.pausal.title")} status={limits.pausalLimit} compact />
            <LimitCard title={t("limits.vat.title")} status={limits.vatLimit} compact />
          </div>
        ) : null}
      </section>

      <InvoiceStatusBreakdown invoices={invoices} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInvoicesList invoices={invoices} isLoading={invoicesLoading} />
        <TopClientsList invoices={invoices} isLoading={invoicesLoading} />
      </div>
    </div>
  );
};

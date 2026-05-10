import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useLimits } from "@/entities/limits/api/limits.queries";
import { useInvoices } from "@/entities/invoice/api/invoice.queries";
import { LimitCard } from "@/entities/limits/ui/LimitCard";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { InvoiceStatusBadge } from "@/entities/invoice/ui/InvoiceStatusBadge";
import { ArrowRight, FileText } from "lucide-react";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { data: limits, isLoading: limitsLoading } = useLimits();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();

  const recentInvoices = invoices?.slice(0, 5) ?? [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("dashboard.invoices.title")}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/invoices" className="flex items-center gap-1 text-sm">
              {t("dashboard.invoices.viewAll")} <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {invoicesLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                <FileText className="size-8 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">{t("dashboard.invoices.empty")}</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-medium text-sm w-16">{invoice.displayNumber}</span>
                      <span className="text-sm text-muted-foreground">{invoice.clientName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {invoice.totalAmount.toLocaleString()} {invoice.currency}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {format(new Date(invoice.issueDate), "dd.MM.yyyy")}
                      </span>
                      <InvoiceStatusBadge status={invoice.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

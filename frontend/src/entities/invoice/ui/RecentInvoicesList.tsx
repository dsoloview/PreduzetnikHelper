import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import type { IInvoiceResponse } from "@preduzetnik/shared";

interface RecentInvoicesListProps {
  invoices: IInvoiceResponse[];
  isLoading: boolean;
}

export const RecentInvoicesList = ({ invoices, isLoading }: RecentInvoicesListProps) => {
  const { t } = useTranslation();
  const recent = invoices.slice(0, 5);

  return (
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
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <FileText className="size-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">{t("dashboard.invoices.empty")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {recent.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-medium text-sm w-16">{invoice.displayNumber}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-28">
                      {invoice.clientName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium hidden sm:block">
                      {invoice.totalAmount.toLocaleString()} {invoice.currency}
                    </span>
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {format(new Date(invoice.issueDate), "dd.MM.yy")}
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
  );
};

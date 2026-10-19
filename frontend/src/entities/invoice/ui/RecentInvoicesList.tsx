import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import type { IInvoiceResponse } from "@preduzetnik/shared";
import { Card } from "@/shared/ui/card";
import { Money } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/skeleton";
import { SectionHeader } from "@/shared/ui/section-header";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { getDisplayStatus } from "../lib/display-status";

interface RecentInvoicesListProps {
  invoices: IInvoiceResponse[];
  isLoading: boolean;
}

export const RecentInvoicesList = ({ invoices, isLoading }: RecentInvoicesListProps) => {
  const { t } = useTranslation();
  const recent = invoices.slice(0, 5);

  return (
    <section className="space-y-3">
      <SectionHeader title={t("dashboard.invoices.title")} linkTo="/invoices" linkLabel={t("dashboard.invoices.viewAll")} />
      <Card className="gap-0 py-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("dashboard.invoices.empty")}</p>
          </div>
        ) : (
          <ul className="divide-y">
            {recent.map((invoice) => (
              <li key={invoice.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{invoice.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.displayNumber} · {format(new Date(invoice.issueDate), "dd.MM.yyyy")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Money amount={invoice.totalAmount} currency={invoice.currency} className="text-sm font-medium" />
                  <InvoiceStatusBadge status={getDisplayStatus(invoice)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
};

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import type { IInvoiceResponse } from "@preduzetnik/shared";

import { Card } from "@/shared/ui/card";
import { Money } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/skeleton";
import { SectionHeader } from "@/shared/ui/section-header";
import { InvoiceStatusBadge } from "@/entities/invoice/ui/InvoiceStatusBadge";
import { getDaysOverdue } from "@/entities/invoice/lib/display-status";

const MAX_ITEMS = 5;

interface AttentionListProps {
  invoices: IInvoiceResponse[];
  isLoading: boolean;
}

/** Overdue invoices first (longest overdue on top), then drafts that were never sent */
export const AttentionList = ({ invoices, isLoading }: AttentionListProps) => {
  const { t } = useTranslation();

  const overdue = invoices
    .map((invoice) => ({ invoice, days: getDaysOverdue(invoice) }))
    .filter(({ days }) => days > 0)
    .sort((a, b) => b.days - a.days);
  const drafts = invoices.filter((invoice) => invoice.status === "DRAFT");
  const items = [
    ...overdue.map(({ invoice, days }) => ({ invoice, note: t("dashboard.attention.overdue", { days }), status: "OVERDUE" as const })),
    ...drafts.map((invoice) => ({
      invoice,
      note: t("dashboard.attention.draft", { date: format(new Date(invoice.issueDate), "dd.MM.yyyy") }),
      status: "DRAFT" as const,
    })),
  ];

  return (
    <section className="space-y-3">
      <SectionHeader
        title={t("dashboard.attention.title")}
        linkTo={overdue.length > 0 ? "/invoices?status=OVERDUE" : drafts.length > 0 ? "/invoices?status=DRAFT" : undefined}
        linkLabel={t("dashboard.invoices.viewAll")}
      />
      <Card className="gap-0 py-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
            <CheckCircle2 className="size-5 shrink-0 text-success" />
            {t("dashboard.attention.empty")}
          </div>
        ) : (
          <ul className="divide-y">
            {items.slice(0, MAX_ITEMS).map(({ invoice, note, status }) => (
              <li key={invoice.id}>
                <Link
                  to={`/invoices?status=${status}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <InvoiceStatusBadge status={status} className="hidden sm:inline-flex" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {invoice.displayNumber} · {invoice.clientName}
                    </p>
                    <p className={status === "OVERDUE" ? "text-xs text-destructive-strong" : "text-xs text-muted-foreground"}>
                      {note}
                    </p>
                  </div>
                  <Money amount={invoice.totalAmount} currency={invoice.currency} className="text-sm font-medium" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
};

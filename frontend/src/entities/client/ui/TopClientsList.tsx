import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import type { IInvoiceResponse } from "@preduzetnik/shared";
import { Card } from "@/shared/ui/card";
import { Money } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/skeleton";
import { SectionHeader } from "@/shared/ui/section-header";

interface TopClientsListProps {
  invoices: IInvoiceResponse[];
  isLoading: boolean;
}

/** Clients by income received this year, with each one's share of the total */
export const TopClientsList = ({ invoices, isLoading }: TopClientsListProps) => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const totals = new Map<string, { name: string; total: number }>();
  for (const inv of invoices) {
    if (inv.status !== "PAID" || !inv.paidAt || new Date(inv.paidAt).getFullYear() !== year) continue;
    const current = totals.get(inv.clientId) ?? { name: inv.clientName, total: 0 };
    totals.set(inv.clientId, { name: inv.clientName, total: current.total + inv.totalRsd });
  }
  const grandTotal = [...totals.values()].reduce((sum, c) => sum + c.total, 0);
  const topClients = [...totals.entries()].sort(([, a], [, b]) => b.total - a.total).slice(0, 5);

  return (
    <section className="space-y-3">
      <SectionHeader title={t("dashboard.clients.title", { year })} linkTo="/clients" linkLabel={t("dashboard.clients.viewAll")} />
      <Card className="gap-0 py-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8" />)}
          </div>
        ) : topClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("dashboard.clients.empty")}</p>
          </div>
        ) : (
          <ul className="divide-y">
            {topClients.map(([id, client]) => {
              const share = grandTotal > 0 ? (client.total / grandTotal) * 100 : 0;
              return (
                <li key={id} className="space-y-1.5 px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{client.name}</span>
                    <Money amount={client.total} currency="RSD" className="text-muted-foreground" />
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${share}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
};

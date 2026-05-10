import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import type { IInvoiceResponse } from "@preduzetnik/shared";

interface TopClientsListProps {
  invoices: IInvoiceResponse[];
  isLoading: boolean;
}

export const TopClientsList = ({ invoices, isLoading }: TopClientsListProps) => {
  const { t } = useTranslation();

  const topClients = (() => {
    const map = new Map<string, { name: string; total: number }>();
    for (const inv of invoices) {
      const cur = map.get(inv.clientId) ?? { name: inv.clientName, total: 0 };
      map.set(inv.clientId, { name: inv.clientName, total: cur.total + inv.totalRsd });
    }
    return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 3);
  })();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("dashboard.clients.title")}</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/clients" className="flex items-center gap-1 text-sm">
            {t("dashboard.clients.viewAll")} <ArrowRight className="size-3.5" />
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
          ) : topClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <Users className="size-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">{t("dashboard.clients.empty")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {topClients.map((client, i) => (
                <div key={client.name} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{client.name}</span>
                  </div>
                  <span className="text-sm font-mono font-medium">
                    {client.total.toLocaleString("sr-RS", { maximumFractionDigits: 0 })} RSD
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

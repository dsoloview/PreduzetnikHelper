import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Search, Users } from "lucide-react";
import type { IClient, IInvoiceResponse } from "@preduzetnik/shared";

import { useClients } from "@/entities/client/api/client.queries";
import { useInvoices } from "@/entities/invoice/api/invoice.queries";
import { ClientActionsMenu } from "@/entities/client/ui/ClientActionsMenu";
import { CreateClientDialog } from "@/features/client-management/ui/CreateClientDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Money } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageContainer, PageHeader } from "@/shared/ui/page-header";

interface ClientStats {
  invoiceCount: number;
  /** All-time income from the client: paid invoices, in RSD */
  receivedRsd: number;
  lastInvoiceDate: string | null;
}

const EMPTY_STATS: ClientStats = { invoiceCount: 0, receivedRsd: 0, lastInvoiceDate: null };

const buildStats = (invoices: IInvoiceResponse[]) => {
  const stats = new Map<string, ClientStats>();
  for (const inv of invoices) {
    if (inv.status === "CANCELLED") continue;
    const current = stats.get(inv.clientId) ?? { ...EMPTY_STATS };
    current.invoiceCount += 1;
    if (inv.status === "PAID") current.receivedRsd += inv.totalRsd;
    if (!current.lastInvoiceDate || inv.issueDate > current.lastInvoiceDate) current.lastInvoiceDate = inv.issueDate;
    stats.set(inv.clientId, current);
  }
  return stats;
};

const ClientType = ({ client }: { client: IClient }) => {
  const { t } = useTranslation();
  return (
    <span className="text-xs text-muted-foreground">
      {t(`clients.type.${client.type.toLowerCase()}`)}
    </span>
  );
};

export const ClientsPage = () => {
  const { t } = useTranslation();
  const { data: clients = [], isLoading, error } = useClients();
  const { data: invoices = [] } = useInvoices();
  const [search, setSearch] = useState("");

  const stats = useMemo(() => buildStats(invoices), [invoices]);

  // Most valuable clients first
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.taxId.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
      .map((client) => ({ client, stats: stats.get(client.id) ?? EMPTY_STATS }))
      .sort((a, b) => b.stats.receivedRsd - a.stats.receivedRsd || a.client.name.localeCompare(b.client.name));
  }, [clients, stats, search]);

  const formatDate = (iso: string | null) => (iso ? format(new Date(iso), "dd.MM.yyyy") : "—");

  return (
    <PageContainer>
      <PageHeader title={t("nav.clients")} description={t("clients.subtitle")} actions={<CreateClientDialog />} />

      {error ? (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="text-destructive">{t("clients.loadError")}</p>
        </div>
      ) : !isLoading && clients.length === 0 ? (
        <Card className="items-center gap-4 py-16 text-center">
          <Users className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">{t("clients.empty")}</p>
          <CreateClientDialog />
        </Card>
      ) : (
        <>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("clients.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
            />
          </div>

          {/* Desktop: table */}
          <Card className="hidden gap-0 py-0 md:flex">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">{t("clients.table.name")}</TableHead>
                  <TableHead>{t("clients.table.taxId")}</TableHead>
                  <TableHead>{t("clients.table.city")}</TableHead>
                  <TableHead className="text-right">{t("clients.table.invoices")}</TableHead>
                  <TableHead className="text-right">{t("clients.table.received")}</TableHead>
                  <TableHead>{t("clients.table.lastInvoice")}</TableHead>
                  <TableHead className="pr-4"><span className="sr-only">{t("clients.actions.menu")}</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? [1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7} className="px-4"><Skeleton className="h-8" /></TableCell>
                      </TableRow>
                    ))
                  : rows.map(({ client, stats: s }) => (
                      <TableRow key={client.id}>
                        <TableCell className="pl-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{client.name}</span>
                            <ClientType client={client} />
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{client.taxId}</TableCell>
                        <TableCell className="text-muted-foreground">{client.city}, {client.country}</TableCell>
                        <TableCell className="text-right">{s.invoiceCount}</TableCell>
                        <TableCell className="text-right">
                          {s.receivedRsd > 0 ? <Money amount={s.receivedRsd} currency="RSD" className="font-medium" /> : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(s.lastInvoiceDate)}</TableCell>
                        <TableCell className="pr-4 text-right"><ClientActionsMenu client={client} /></TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </Card>

          {/* Phones: compact cards */}
          <div className="space-y-2 md:hidden">
            {isLoading
              ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              : rows.map(({ client, stats: s }) => (
                  <Card key={client.id} className="flex-row items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{client.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {client.city}, {client.country} · {t("clients.invoiceCount", { count: s.invoiceCount })}
                      </p>
                    </div>
                    {s.receivedRsd > 0 && <Money amount={s.receivedRsd} currency="RSD" className="text-sm font-medium" />}
                    <ClientActionsMenu client={client} />
                  </Card>
                ))}
          </div>
        </>
      )}
    </PageContainer>
  );
};

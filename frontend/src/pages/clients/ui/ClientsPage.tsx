import { useTranslation } from "react-i18next";
import { useClients } from "@/entities/client/api/client.queries";
import { ClientCard } from "@/entities/client/ui/ClientCard";
import { CreateClientDialog } from "@/features/client-management/ui/CreateClientDialog";

export const ClientsPage = () => {
  const { t } = useTranslation();
  const { data: clients, isLoading, error } = useClients();

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.clients")}</h1>
          <p className="text-muted-foreground">{t("clients.subtitle")}</p>
        </div>
        <CreateClientDialog />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-destructive">{t("clients.loadError")}</p>
        </div>
      ) : clients?.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-lg space-y-4">
          <p className="text-muted-foreground">{t("clients.empty")}</p>
          <CreateClientDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients?.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
};

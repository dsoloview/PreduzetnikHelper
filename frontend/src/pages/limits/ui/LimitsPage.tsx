import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import { useLimits } from "@/entities/limits/api/limits.queries";
import { LimitCard } from "@/entities/limits/ui/LimitCard";
import { Card, CardContent } from "@/shared/ui/card";

export const LimitsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useLimits();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <TrendingUp className="size-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.limits")}</h1>
          <p className="text-muted-foreground">{t("limits.subtitle")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-52 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-destructive">{t("limits.loadError")}</p>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LimitCard
              title={t("limits.pausal.title")}
              description={t("limits.pausal.description")}
              status={data.pausalLimit}
            />
            <LimitCard
              title={t("limits.vat.title")}
              description={t("limits.vat.description")}
              status={data.vatLimit}
            />
          </div>

          <Card className="bg-muted/40">
            <CardContent className="pt-4 text-sm text-muted-foreground space-y-1">
              <p>⚡ <strong>{t("limits.info.pausal")}</strong></p>
              <p>⚡ <strong>{t("limits.info.vat")}</strong></p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

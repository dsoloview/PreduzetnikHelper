import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { useLimits } from "@/entities/limits/api/limits.queries";
import { LimitCard } from "@/entities/limits/ui/LimitCard";
import { PageContainer, PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export const LimitsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useLimits();

  return (
    <PageContainer>
      <PageHeader title={t("nav.limits")} description={t("limits.subtitle")} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="text-destructive">{t("limits.loadError")}</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LimitCard title={t("limits.pausal.title")} description={t("limits.pausal.description")} status={data.pausalLimit} />
          <LimitCard title={t("limits.vat.title")} description={t("limits.vat.description")} status={data.vatLimit} />
        </div>
      ) : null}

      <section className="flex gap-3 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">{t("limits.info.title")}</p>
          <p>{t("limits.info.pausal")}</p>
          <p>{t("limits.info.vat")}</p>
          <p>{t("limits.info.thresholds")}</p>
        </div>
      </section>
    </PageContainer>
  );
};

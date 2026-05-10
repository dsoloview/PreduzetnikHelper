import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import type { ILimitStatus } from "@preduzetnik/shared";

const formatRsd = (value: number) =>
  value.toLocaleString("sr-RS", { maximumFractionDigits: 0 }) + " RSD";

interface LimitCardProps {
  title: string;
  description?: string;
  status: ILimitStatus;
  compact?: boolean;
}

export const LimitCard = ({ title, description, status, compact = false }: LimitCardProps) => {
  const { t } = useTranslation();

  const color = status.isExceeded
    ? "text-destructive"
    : status.percentage >= 80
      ? "text-yellow-600"
      : "text-green-600";

  const progressColor = status.isExceeded
    ? "[&>[data-slot=progress-indicator]]:bg-destructive"
    : status.percentage >= 80
      ? "[&>[data-slot=progress-indicator]]:bg-yellow-500"
      : "[&>[data-slot=progress-indicator]]:bg-green-500";

  const Icon = status.isExceeded ? AlertTriangle : CheckCircle2;

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={`size-4 ${color}`} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className={`text-2xl font-bold ${color}`}>
              {status.percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatRsd(status.current)} / {formatRsd(status.limit)}
            </p>
          </div>
          <Progress value={Math.min(status.percentage, 100)} className={`h-2 ${progressColor}`} />
          <p className="text-xs text-muted-foreground">
            {t("limits.remaining")}: <span className={`font-medium ${color}`}>{formatRsd(status.remaining)}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <Icon className={`size-5 mt-0.5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("limits.used")}</span>
            <span className={`font-semibold ${color}`}>{status.percentage.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(status.percentage, 100)} className={`h-3 ${progressColor}`} />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">{t("limits.current")}</p>
            <p className="font-semibold">{formatRsd(status.current)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">{t("limits.limit")}</p>
            <p className="font-semibold">{formatRsd(status.limit)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">{t("limits.remaining")}</p>
            <p className={`font-semibold ${color}`}>{formatRsd(status.remaining)}</p>
          </div>
        </div>

        {status.isExceeded && (
          <Badge variant="destructive" className="w-full justify-center">
            {t("limits.exceeded")}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

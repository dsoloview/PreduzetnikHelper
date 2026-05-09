import { Badge } from "@/shared/ui/badge";
import { InvoiceStatus } from "@preduzetnik/shared";
import { useTranslation } from "react-i18next";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const { t } = useTranslation();

  const variants: Record<InvoiceStatus, string> = {
    DRAFT: "secondary",
    SENT: "default",
    PAID: "success", // I might need to add success variant to Badge
    CANCELLED: "destructive",
  };

  return (
    <Badge variant={variants[status] as any}>
      {t(`invoices.status.${status.toLowerCase()}`)}
    </Badge>
  );
};

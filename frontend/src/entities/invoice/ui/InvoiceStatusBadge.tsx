import { Badge } from "@/shared/ui/badge";
import type { InvoiceStatus } from "@preduzetnik/shared";
import { useTranslation } from "react-i18next";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const STATUS_VARIANT: Record<InvoiceStatus, BadgeVariant> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "outline",
  CANCELLED: "destructive",
};

const STATUS_CLASS: Partial<Record<InvoiceStatus, string>> = {
  PAID: "border-green-500 text-green-600 dark:text-green-400",
};

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Badge variant={STATUS_VARIANT[status]} className={STATUS_CLASS[status]}>
      {t(`invoices.status.${status.toLowerCase()}`)}
    </Badge>
  );
};

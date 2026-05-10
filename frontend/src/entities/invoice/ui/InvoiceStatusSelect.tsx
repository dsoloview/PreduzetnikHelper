import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { InvoiceStatus } from "@preduzetnik/shared";
import { useUpdateInvoiceStatus } from "@/entities/invoice/api/invoice.queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";

const TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["PAID", "CANCELLED"],
  PAID: [],
  CANCELLED: [],
};

interface InvoiceStatusSelectProps {
  invoiceId: string;
  status: InvoiceStatus;
}

export const InvoiceStatusSelect = ({ invoiceId, status }: InvoiceStatusSelectProps) => {
  const { t } = useTranslation();
  const { mutate, isPending } = useUpdateInvoiceStatus();

  const next = TRANSITIONS[status];

  if (next.length === 0) {
    return <InvoiceStatusBadge status={status} />;
  }

  const handleChange = (newStatus: InvoiceStatus) => {
    mutate(
      { id: invoiceId, status: newStatus },
      {
        onSuccess: () => toast.success(t("invoices.status.updateSuccess")),
        onError: () => toast.error(t("invoices.status.updateError")),
      },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="h-auto p-0 hover:bg-transparent focus-visible:ring-0"
        >
          <InvoiceStatusBadge status={status} />
          <ChevronDown className="ml-1 size-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {next.map((s) => (
          <DropdownMenuItem key={s} onClick={() => handleChange(s)}>
            <InvoiceStatusBadge status={s} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

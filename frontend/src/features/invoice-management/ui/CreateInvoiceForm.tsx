import { useTranslation } from "react-i18next";
import { InvoiceForm } from "./InvoiceForm";
import type { ICreateInvoiceRequest } from "@preduzetnik/shared";

interface CreateInvoiceFormProps {
  onSubmit: (data: ICreateInvoiceRequest) => void;
  isLoading?: boolean;
}

export const CreateInvoiceForm = ({ onSubmit, isLoading }: CreateInvoiceFormProps) => {
  const { t } = useTranslation();

  return (
    <InvoiceForm
      onSubmit={onSubmit}
      isLoading={isLoading}
      submitLabel={t("invoices.form.submit")}
    />
  );
};

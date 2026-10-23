import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { ICreateInvoiceRequest, IInvoiceResponse } from "@preduzetnik/shared";

import { useCreateInvoice, useInvoice, useUpdateInvoice } from "@/entities/invoice/api/invoice.queries";
import { useProfile } from "@/entities/user/api/user.queries";
import { useClients } from "@/entities/client/api/client.queries";
import { useBankAccounts } from "@/entities/bank-account/api/bank-account.queries";
import { useInvoices } from "@/entities/invoice/api/invoice.queries";
import { InvoiceForm, type InvoiceFormValues } from "@/features/invoice-management/ui/InvoiceForm";
import { defaultsForClient, repeatInvoice } from "@/features/invoice-management/lib/invoice-defaults";
import { ProfileCompletenessAlert } from "@/widgets/profile-completeness/ui/ProfileCompletenessAlert";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { Skeleton } from "@/shared/ui/skeleton";

const toFormValues = (invoice: IInvoiceResponse): Partial<InvoiceFormValues> => ({
  clientId: invoice.clientId,
  bankAccountId: invoice.bankAccountId,
  issueDate: new Date(invoice.issueDate),
  dueDate: new Date(invoice.dueDate),
  placeOfIssue: invoice.placeOfIssue,
  domesticSupply: invoice.domesticSupply,
  currency: invoice.currency,
  exchangeRate: invoice.exchangeRate ?? undefined,
  items: invoice.items.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice })),
  note: invoice.note ?? "",
});

const withoutUnset = <T extends object>(values: T): Partial<T> =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as Partial<T>;

export const InvoiceEditorPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get("from") ?? undefined;
  const clientId = searchParams.get("clientId") ?? undefined;

  const source = useInvoice(id ?? fromId);
  const profile = useProfile();
  const clients = useClients();
  const bankAccounts = useBankAccounts();
  const invoices = useInvoices();
  const presetClient = clientId ? clients.data?.find((c) => c.id === clientId) : undefined;
  const clientDefaults = useMemo(
    () =>
      presetClient && bankAccounts.data && invoices.data
        ? defaultsForClient(presetClient, invoices.data, bankAccounts.data, new Date(), undefined)
        : null,
    [presetClient, bankAccounts.data, invoices.data],
  );
  const create = useCreateInvoice();
  const update = useUpdateInvoice();

  const goBack = () => (location.key === "default" ? navigate("/invoices") : navigate(-1));

  const onSubmit = (data: ICreateInvoiceRequest) => {
    const onError = (error: unknown) =>
      toast.error(getApiErrorMessage(error, t(id ? "invoices.edit.error" : "errors.createInvoiceFailed")));
    if (id) {
      update.mutate(
        { id, dto: data },
        {
          onSuccess: () => {
            toast.success(t("invoices.edit.success"));
            goBack();
          },
          onError,
        },
      );
    } else {
      create.mutate(data, {
        onSuccess: (invoice) => {
          toast.success(t("invoices.create.successNumber", { number: invoice.displayNumber }));
          navigate("/invoices");
        },
        onError,
      });
    }
  };

  const title = id
    ? t("invoices.edit.titleNumber", { number: source.data?.displayNumber ?? "" })
    : t("invoices.create.title");
  const description = id
    ? t("invoices.edit.description")
    : fromId && source.data
      ? t("invoices.create.repeatDescription", { number: source.data.displayNumber })
      : t("invoices.create.description");

  const isLoading =
    profile.isLoading ||
    ((!!id || !!fromId) && source.isLoading) ||
    (!!clientId && (clients.isLoading || bankAccounts.isLoading || invoices.isLoading));
  const notFound = (!!id || !!fromId) && source.isError;
  const notEditable = !!id && source.data && source.data.status !== "DRAFT";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:p-6 lg:p-8">
      <div>
        <Link to="/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          {t("nav.invoices")}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {!id && <ProfileCompletenessAlert />}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : notFound ? (
        <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">{t("invoices.notFound")}</p>
      ) : notEditable ? (
        <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">{t("invoices.edit.notDraft")}</p>
      ) : (
        <InvoiceForm
          onSubmit={onSubmit}
          onCancel={goBack}
          defaultValues={
            id && source.data
              ? toFormValues(source.data)
              : fromId && source.data
                ? repeatInvoice(source.data, new Date())
                : presetClient && clientDefaults
                  ? withoutUnset({
                      clientId: presetClient.id,
                      domesticSupply: clientDefaults.domesticSupply,
                      bankAccountId: clientDefaults.bankAccountId,
                      currency: clientDefaults.currency,
                      dueDate: clientDefaults.dueDate,
                      items: clientDefaults.items,
                    })
                  : undefined
          }
          initialPrefilledFrom={!id && !fromId ? clientDefaults?.prefilledFrom : null}
          isLoading={create.isPending || update.isPending}
          submitLabel={id ? t("invoices.edit.submit") : t("invoices.form.submit")}
        />
      )}
    </div>
  );
};

import { useMemo, useEffect, useRef } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { format, addDays } from "date-fns";
import { Plus, Trash2, CalendarIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { Checkbox } from "@/shared/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { RequiredMark } from "@/shared/ui/required-mark";
import { FormActions, FormSection } from "@/shared/ui/form-layout";
import { cn } from "@/shared/lib/utils";
import { useFormatters } from "@/shared/lib/format";

import { useClients } from "@/entities/client/api/client.queries";
import { useBankAccounts } from "@/entities/bank-account/api/bank-account.queries";
import { useProfile } from "@/entities/user/api/user.queries";
import { useExchangeRates } from "@/entities/exchange-rate/api/exchange-rate.queries";
import type { ICreateInvoiceRequest, Currency } from "@preduzetnik/shared";

const buildInvoiceSchema = (t: (key: string) => string) =>
  z
    .object({
      clientId: z.string().min(1, t("invoices.form.errors.clientRequired")),
      bankAccountId: z.string().min(1, t("invoices.form.errors.bankAccountRequired")),
      issueDate: z.date(),
      dueDate: z.date(),
      placeOfIssue: z.string().min(1, t("invoices.form.errors.placeOfIssueRequired")),
      domesticSupply: z.boolean(),
      currency: z.enum(["RSD", "EUR", "USD"]),
      exchangeRate: z.number().positive().optional(),
      items: z
        .array(
          z.object({
            description: z.string().min(1, t("invoices.form.errors.itemDescription")),
            quantity: z.number({ message: t("invoices.form.errors.itemQuantity") })
              .min(0.01, t("invoices.form.errors.itemQuantity")),
            unitPrice: z.number({ message: t("invoices.form.errors.itemPrice") })
              .min(0, t("invoices.form.errors.itemPrice")),
          }),
        )
        .min(1, t("invoices.form.errors.itemsMin")),
      note: z.string().optional(),
    })
    .refine((data) => data.currency === "RSD" || !!data.exchangeRate, {
      message: t("invoices.form.errors.exchangeRateRequired"),
      path: ["exchangeRate"],
    })
    .refine((data) => data.dueDate.getTime() >= data.issueDate.getTime(), {
      message: t("invoices.form.errors.dueDateAfterIssue"),
      path: ["dueDate"],
    });

/** Quick picks for the due date, counted from the issue date */
const DUE_IN_DAYS = [7, 15, 30] as const;

export type InvoiceFormValues = z.infer<ReturnType<typeof buildInvoiceSchema>>;

interface InvoiceFormProps {
  onSubmit: (data: ICreateInvoiceRequest) => void;
  defaultValues?: Partial<InvoiceFormValues>;
  isLoading?: boolean;
  submitLabel?: string;
}

export const InvoiceForm = ({ onSubmit, defaultValues, isLoading, submitLabel }: InvoiceFormProps) => {
  const { t } = useTranslation();
  const { data: clients } = useClients();
  const { data: bankAccounts } = useBankAccounts();
  const { data: profile } = useProfile();
  const { number, money } = useFormatters();

  const schema = useMemo(() => buildInvoiceSchema(t), [t]);

  const today = useMemo(() => new Date(), []);

  const defaultAccount = useMemo(
    () => bankAccounts?.find((a) => a.isDefault) ?? bankAccounts?.[0],
    [bankAccounts],
  );

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      issueDate: today,
      dueDate: addDays(today, 15),
      placeOfIssue: profile?.city ?? "Beograd",
      domesticSupply: true,
      currency: "RSD",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      note: "",
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedBankAccountId = useWatch({ control: form.control, name: "bankAccountId" });
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const currency = useWatch({ control: form.control, name: "currency" });
  const issueDate = useWatch({ control: form.control, name: "issueDate" });

  const rateDate = issueDate ? format(issueDate, "yyyy-MM-dd") : undefined;
  const { data: nbsRates, isFetching: isRateLoading } = useExchangeRates(rateDate, currency !== "RSD");
  const nbsRate = nbsRates?.rates.find((r) => r.currencyCode === currency);

  // When editing, keep the saved rate until the user changes currency or issue date
  const savedRateKey = useRef(
    defaultValues?.exchangeRate && defaultValues.issueDate
      ? `${defaultValues.currency}|${format(defaultValues.issueDate, "yyyy-MM-dd")}`
      : null,
  );

  // Fill in the NBS middle rate for the issue date; a value typed by hand stays until currency or date changes
  useEffect(() => {
    if (!nbsRate) return;
    if (savedRateKey.current === `${currency}|${rateDate}`) return;
    savedRateKey.current = null;
    form.setValue("exchangeRate", nbsRate.middleRate, { shouldValidate: true });
  }, [nbsRate?.middleRate, currency, rateDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select default (or first) bank account once the list loads
  useEffect(() => {
    if (!defaultAccount) return;
    if (defaultValues?.bankAccountId) return;
    if (form.getValues("bankAccountId")) return;
    form.setValue("bankAccountId", defaultAccount.id, { shouldValidate: false });
    form.setValue("currency", defaultAccount.currency, { shouldValidate: false });
  }, [defaultAccount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Supply to a foreign client usually happens outside Serbia and doesn't count toward the 8M VAT limit
  const watchedClientId = useWatch({ control: form.control, name: "clientId" });
  useEffect(() => {
    if (!watchedClientId || watchedClientId === defaultValues?.clientId) return;
    const client = clients?.find((c) => c.id === watchedClientId);
    if (client) {
      form.setValue("domesticSupply", client.type === "DOMESTIC", { shouldValidate: false });
    }
  }, [watchedClientId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync currency when the user picks a different bank account
  useEffect(() => {
    if (!watchedBankAccountId) return;
    const account = bankAccounts?.find((a) => a.id === watchedBankAccountId);
    if (account) {
      form.setValue("currency", account.currency, { shouldValidate: false });
    }
  }, [watchedBankAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalAmount = watchedItems.reduce(
    (acc, item) => acc + ((item?.quantity ?? 0) * (item?.unitPrice ?? 0)),
    0,
  );
  const itemsRootError = form.formState.errors.items?.root?.message
    ?? form.formState.errors.items?.message;

  const handleFormSubmit = (values: InvoiceFormValues) => {
    const requestData: ICreateInvoiceRequest = {
      ...values,
      // Date only: toISOString() would shift local midnight to the previous day in UTC
      issueDate: format(values.issueDate, "yyyy-MM-dd"),
      dueDate: format(values.dueDate, "yyyy-MM-dd"),
      currency: values.currency as Currency,
      items: values.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
    onSubmit(requestData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormSection title={t("invoices.form.sections.client")} description={t("invoices.form.sections.clientDesc")}>
          <Controller
            name="clientId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                <FieldLabel>{t("invoices.form.client")}<RequiredMark /></FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("invoices.form.selectClient")} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="bankAccountId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                <FieldLabel>{t("invoices.form.bankAccount")}<RequiredMark /></FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("invoices.form.selectBankAccount")} />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} · {account.currency} ({account.accountNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="currency"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("invoices.form.currency")}</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RSD">RSD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          {currency !== "RSD" && (
            <Field data-invalid={!!form.formState.errors.exchangeRate}>
              <FieldLabel>{t("invoices.form.exchangeRate")}<RequiredMark /></FieldLabel>
              <Input
                inputMode="decimal"
                aria-invalid={!!form.formState.errors.exchangeRate}
                {...form.register("exchangeRate", {
                  setValueAs: (v) => (v === "" || v === "-" ? undefined : Number(v)),
                })}
              />
              {form.formState.errors.exchangeRate && (
                <FieldError errors={[form.formState.errors.exchangeRate]} />
              )}
              <p className="text-xs text-muted-foreground">
                {isRateLoading
                  ? t("invoices.form.exchangeRateLoading")
                  : nbsRate
                    ? t("invoices.form.exchangeRateHint", {
                        rate: nbsRate.middleRate,
                        date: format(new Date(nbsRate.date), "dd.MM.yyyy"),
                      })
                    : t("invoices.form.exchangeRateUnavailable")}
              </p>
            </Field>
          )}
      </FormSection>

      <FormSection title={t("invoices.form.sections.dates")} description={t("invoices.form.sections.datesDesc")}>
          <Controller
            name="issueDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("invoices.form.issueDate")}<RequiredMark /></FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "dd.MM.yyyy") : <span>{t("invoices.form.pickDate")}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="dueDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("invoices.form.dueDate")}<RequiredMark /></FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "dd.MM.yyyy") : <span>{t("invoices.form.pickDate")}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-1">
                  {DUE_IN_DAYS.map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => field.onChange(addDays(form.getValues("issueDate") ?? today, days))}
                      className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {t("invoices.form.dueIn", { days })}
                    </button>
                  ))}
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="placeOfIssue"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("invoices.form.placeOfIssue")}<RequiredMark /></FieldLabel>
                <Input {...field} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="domesticSupply"
            control={form.control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 sm:col-span-2">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                <span>
                  <span className="block text-sm font-medium">{t("invoices.form.domesticSupply")}</span>
                  <span className="block text-xs text-muted-foreground">{t("invoices.form.domesticSupplyHint")}</span>
                </span>
              </label>
            )}
          />
      </FormSection>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">{t("invoices.form.items")}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("invoices.form.itemsDesc")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("invoices.form.addItem")}
          </Button>
        </div>

        <div className="-mx-1 overflow-x-auto px-1">
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">
                {t("invoices.form.description")}<RequiredMark />
              </TableHead>
              <TableHead className="w-[15%]">
                {t("invoices.form.quantity")}<RequiredMark />
              </TableHead>
              <TableHead className="w-[20%]">
                {t("invoices.form.price")}<RequiredMark />
              </TableHead>
              <TableHead className="w-[20%] text-right">{t("invoices.form.total")}</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const itemErrors = form.formState.errors.items?.[index];
              const row = watchedItems[index];
              const rowTotal = (row?.quantity ?? 0) * (row?.unitPrice ?? 0);
              return (
                <TableRow key={field.id} className="align-top">
                  <TableCell>
                    <Input
                      {...form.register(`items.${index}.description`)}
                      aria-invalid={!!itemErrors?.description}
                    />
                    {itemErrors?.description?.message && (
                      <p className="mt-1 text-xs text-destructive">
                        {itemErrors.description.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      inputMode="decimal"
                      aria-invalid={!!itemErrors?.quantity}
                      {...form.register(`items.${index}.quantity`, {
                        setValueAs: (v) => (v === "" || v === "-" ? undefined : Number(v)),
                      })}
                    />
                    {itemErrors?.quantity?.message && (
                      <p className="mt-1 text-xs text-destructive">
                        {itemErrors.quantity.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      inputMode="decimal"
                      aria-invalid={!!itemErrors?.unitPrice}
                      {...form.register(`items.${index}.unitPrice`, {
                        setValueAs: (v) => (v === "" || v === "-" ? undefined : Number(v)),
                      })}
                    />
                    {itemErrors?.unitPrice?.message && (
                      <p className="mt-1 text-xs text-destructive">
                        {itemErrors.unitPrice.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="font-medium pt-3 text-right whitespace-nowrap">
                    {number(rowTotal, 2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      aria-label={t("app.delete")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
        {itemsRootError && (
          <p className="text-sm text-destructive">{itemsRootError}</p>
        )}
      </div>

      <Controller
        name="note"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>{t("invoices.form.note")}</FieldLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              placeholder={t("invoices.form.notePlaceholder")}
              rows={3}
            />
          </Field>
        )}
      />

      <div className="flex flex-col items-end gap-1">
        <div className="text-xs text-muted-foreground italic">{t("invoices.form.noVatNotice")}</div>
        <div className="text-xl font-semibold">
          {t("invoices.form.grandTotal")}: {money(totalAmount, currency, { decimals: 2 })}
        </div>
      </div>

      <FormActions submitLabel={submitLabel ?? t("invoices.form.submit")} isLoading={isLoading} />
    </form>
  );
};

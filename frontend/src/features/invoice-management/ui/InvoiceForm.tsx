import { useMemo, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { format, addDays } from "date-fns";
import { Plus, Trash2, CalendarIcon, ChevronDown, History } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { Checkbox } from "@/shared/ui/checkbox";
import { RequiredMark } from "@/shared/ui/required-mark";
import { FormSection } from "@/shared/ui/form-layout";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/utils";
import { useFormatters } from "@/shared/lib/format";

import { useClients } from "@/entities/client/api/client.queries";
import { useBankAccounts } from "@/entities/bank-account/api/bank-account.queries";
import { useInvoices } from "@/entities/invoice/api/invoice.queries";
import { useProfile } from "@/entities/user/api/user.queries";
import { useExchangeRates } from "@/entities/exchange-rate/api/exchange-rate.queries";
import type { ICreateInvoiceRequest, Currency } from "@preduzetnik/shared";
import { defaultsForClient, itemSuggestions } from "../lib/invoice-defaults";

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

const BLANK_ITEM = { description: "", quantity: 1, unitPrice: 0 };

const toNumber = (v: string) => (v === "" || v === "-" ? undefined : Number(v));

export type InvoiceFormValues = z.infer<ReturnType<typeof buildInvoiceSchema>>;

interface InvoiceFormProps {
  onSubmit: (data: ICreateInvoiceRequest) => void;
  onCancel: () => void;
  defaultValues?: Partial<InvoiceFormValues>;
  initialPrefilledFrom?: string | null;
  isLoading?: boolean;
  submitLabel: string;
}

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <Card className="gap-0 px-4 py-4 sm:px-5 sm:py-5">{children}</Card>
);

export const InvoiceForm = ({
  onSubmit,
  onCancel,
  defaultValues,
  initialPrefilledFrom,
  isLoading,
  submitLabel,
}: InvoiceFormProps) => {
  const { t } = useTranslation();
  const { data: clients } = useClients();
  const { data: bankAccounts } = useBankAccounts();
  const { data: invoices } = useInvoices();
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
      items: [BLANK_ITEM],
      note: "",
      ...defaultValues,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedBankAccountId = useWatch({ control: form.control, name: "bankAccountId" });
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const currency = useWatch({ control: form.control, name: "currency" });
  const issueDate = useWatch({ control: form.control, name: "issueDate" });
  const exchangeRate = useWatch({ control: form.control, name: "exchangeRate" });
  const note = useWatch({ control: form.control, name: "note" });

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

  const [prefilledFrom, setPrefilledFrom] = useState<string | null>(initialPrefilledFrom ?? null);

  const applyClientDefaults = (clientId: string) => {
    const client = clients?.find((c) => c.id === clientId);
    if (!client) return;
    const defaults = defaultsForClient(
      client,
      invoices ?? [],
      bankAccounts ?? [],
      form.getValues("issueDate") ?? today,
      form.getValues("items"),
    );
    const validate = { shouldValidate: form.formState.isSubmitted };
    form.setValue("domesticSupply", defaults.domesticSupply);
    if (defaults.bankAccountId) form.setValue("bankAccountId", defaults.bankAccountId, validate);
    if (defaults.dueDate) form.setValue("dueDate", defaults.dueDate, validate);
    if (defaults.items) replace(defaults.items);
    setPrefilledFrom(defaults.prefilledFrom);
  };

  // Sync currency when the user picks a different bank account
  useEffect(() => {
    if (!watchedBankAccountId) return;
    const account = bankAccounts?.find((a) => a.id === watchedBankAccountId);
    if (account) {
      form.setValue("currency", account.currency, { shouldValidate: false });
    }
  }, [watchedBankAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const suggestions = useMemo(
    () => itemSuggestions(invoices ?? [], currency as Currency),
    [invoices, currency],
  );

  const domesticSupply = useWatch({ control: form.control, name: "domesticSupply" });
  const [showExtra, setShowExtra] = useState(!!defaultValues?.note);

  const totalAmount = watchedItems.reduce(
    (acc, item) => acc + ((item?.quantity ?? 0) * (item?.unitPrice ?? 0)),
    0,
  );
  const itemsRootError = form.formState.errors.items?.root?.message
    ?? form.formState.errors.items?.message;

  const applySuggestion = (index: number, description: string) => {
    const suggestion = suggestions.find((s) => s.description === description);
    if (suggestion && !form.getValues(`items.${index}.unitPrice`)) {
      form.setValue(`items.${index}.unitPrice`, suggestion.unitPrice, { shouldValidate: form.formState.isSubmitted });
    }
  };

  const handleItemKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (index === fields.length - 1) {
      append(BLANK_ITEM, { focusName: `items.${index + 1}.description` });
    } else {
      form.setFocus(`items.${index + 1}.description`);
    }
  };

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
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
      <SectionCard>
        <FormSection title={t("invoices.form.sections.client")} description={t("invoices.form.sections.clientDesc")}>
          <Controller
            name="clientId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                <FieldLabel>{t("invoices.form.client")}<RequiredMark /></FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    applyClientDefaults(value);
                  }}
                >
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
                  <SelectTrigger aria-invalid={fieldState.invalid} className="min-w-0 [&>span]:truncate">
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
                {...form.register("exchangeRate", { setValueAs: toNumber })}
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
      </SectionCard>

      <SectionCard>
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
        </FormSection>
      </SectionCard>

      <SectionCard>
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">{t("invoices.form.items")}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("invoices.form.itemsDesc")}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => append(BLANK_ITEM)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("invoices.form.addItem")}
            </Button>
          </div>

          {prefilledFrom && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-accent/60 px-3 py-2 text-xs">
              <History className="size-3.5 shrink-0 text-primary" />
              <span>{t("invoices.form.prefilledFrom", { number: prefilledFrom })}</span>
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => {
                  replace([BLANK_ITEM]);
                  setPrefilledFrom(null);
                }}
              >
                {t("invoices.form.clearItems")}
              </button>
            </div>
          )}

          <datalist id="invoice-item-suggestions">
            {suggestions.map((s) => (
              <option key={s.description} value={s.description} />
            ))}
          </datalist>

          <div className="hidden grid-cols-[minmax(0,1fr)_5.5rem_8rem_8rem_2.25rem] gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid">
            <span>{t("invoices.form.description")}<RequiredMark /></span>
            <span>{t("invoices.form.quantity")}<RequiredMark /></span>
            <span>{t("invoices.form.price")}<RequiredMark /></span>
            <span className="text-right">{t("invoices.form.total")}</span>
            <span />
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => {
              const itemErrors = form.formState.errors.items?.[index];
              const row = watchedItems[index];
              const rowTotal = (row?.quantity ?? 0) * (row?.unitPrice ?? 0);
              const description = form.register(`items.${index}.description`, {
                onChange: (event) => applySuggestion(index, event.target.value),
              });
              return (
                <div
                  key={field.id}
                  className="space-y-2 rounded-lg border p-3 sm:grid sm:grid-cols-[minmax(0,1fr)_5.5rem_8rem_8rem_2.25rem] sm:items-start sm:gap-2 sm:space-y-0 sm:border-0 sm:p-0"
                >
                  <div>
                    <Input
                      {...description}
                      list="invoice-item-suggestions"
                      autoComplete="off"
                      placeholder={t("invoices.form.description")}
                      aria-label={t("invoices.form.description")}
                      aria-invalid={!!itemErrors?.description}
                      onKeyDown={handleItemKeyDown(index)}
                    />
                    {itemErrors?.description?.message && (
                      <p className="mt-1 text-xs text-destructive">{itemErrors.description.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto_2.25rem] items-start gap-2 sm:contents">
                    <div>
                      <span className="mb-1 block text-xs text-muted-foreground sm:hidden">{t("invoices.form.quantity")}</span>
                      <Input
                        inputMode="decimal"
                        aria-label={t("invoices.form.quantity")}
                        aria-invalid={!!itemErrors?.quantity}
                        onKeyDown={handleItemKeyDown(index)}
                        {...form.register(`items.${index}.quantity`, { setValueAs: toNumber })}
                      />
                      {itemErrors?.quantity?.message && (
                        <p className="mt-1 text-xs text-destructive">{itemErrors.quantity.message}</p>
                      )}
                    </div>
                    <div>
                      <span className="mb-1 block text-xs text-muted-foreground sm:hidden">{t("invoices.form.price")}</span>
                      <Input
                        inputMode="decimal"
                        aria-label={t("invoices.form.price")}
                        aria-invalid={!!itemErrors?.unitPrice}
                        onKeyDown={handleItemKeyDown(index)}
                        {...form.register(`items.${index}.unitPrice`, { setValueAs: toNumber })}
                      />
                      {itemErrors?.unitPrice?.message && (
                        <p className="mt-1 text-xs text-destructive">{itemErrors.unitPrice.message}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="mb-1 block text-xs text-muted-foreground sm:hidden">{t("invoices.form.total")}</span>
                      <p className="text-sm font-medium whitespace-nowrap sm:pt-2">{number(rowTotal, 2)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-5 sm:mt-0"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      aria-label={t("app.delete")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {itemsRootError && <p className="text-sm text-destructive">{itemsRootError}</p>}
          <p className="hidden text-xs text-muted-foreground sm:block">{t("invoices.form.itemsEnterHint")}</p>
        </section>
      </SectionCard>

      <SectionCard>
        <button
          type="button"
          onClick={() => setShowExtra((value) => !value)}
          aria-expanded={showExtra}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <span>
            <span className="block text-sm font-semibold">{t("invoices.form.sections.extra")}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {[
                domesticSupply ? t("invoices.form.domesticSupply") : t("invoices.form.foreignSupply"),
                note?.trim() ? t("invoices.form.hasNote") : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
          <ChevronDown className={cn("mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform", showExtra && "rotate-180")} />
        </button>
        {showExtra && (
          <div className="mt-4 space-y-4">
            <Controller
              name="domesticSupply"
              control={form.control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-medium">{t("invoices.form.domesticSupply")}</span>
                    <span className="block text-xs text-muted-foreground">{t("invoices.form.domesticSupplyHint")}</span>
                  </span>
                </label>
              )}
            />
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
          </div>
        )}
      </SectionCard>

      {/* Negative margins match the editor page padding so the bar spans its full width */}
      <div className="sticky bottom-0 z-10 -mx-4 -mb-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6 lg:-mx-8 lg:-mb-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("invoices.form.grandTotal")}</p>
            <p className="truncate text-lg font-semibold sm:text-xl">{money(totalAmount, currency, { decimals: 2 })}</p>
            <p className="truncate text-xs text-muted-foreground">
              {currency !== "RSD" && exchangeRate
                ? `≈ ${money(totalAmount * exchangeRate, "RSD")} · `
                : ""}
              {t("invoices.form.noVatNotice")}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {t("app.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

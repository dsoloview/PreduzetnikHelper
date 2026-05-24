import { useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/utils";

import { useClients } from "@/entities/client/api/client.queries";
import { useBankAccounts } from "@/entities/bank-account/api/bank-account.queries";
import { useProfile } from "@/entities/user/api/user.queries";
import type { ICreateInvoiceRequest, Currency } from "@preduzetnik/shared";

/**
 * Converts a number-like input value to a number, returning undefined for empty
 * inputs so that Zod's required-number validation fires instead of NaN.
 */
const parseNumericInput = (value: string): number | undefined => {
  if (value === "" || value === "-") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

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

  const schema = useMemo(() => buildInvoiceSchema(t), [t]);

  const today = useMemo(() => new Date(), []);

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

  const watchedItems = form.watch("items");
  const currency = form.watch("currency");
  const totalAmount = watchedItems.reduce(
    (acc, item) => acc + ((item?.quantity ?? 0) * (item?.unitPrice ?? 0)),
    0,
  );
  const itemsRootError = form.formState.errors.items?.root?.message
    ?? form.formState.errors.items?.message;

  const handleFormSubmit = (values: InvoiceFormValues) => {
    const requestData: ICreateInvoiceRequest = {
      ...values,
      issueDate: values.issueDate.toISOString(),
      dueDate: values.dueDate.toISOString(),
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
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Controller
            name="clientId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("invoices.form.client")}</FieldLabel>
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
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("invoices.form.bankAccount")}</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("invoices.form.selectBankAccount")} />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} ({account.accountNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="placeOfIssue"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("invoices.form.placeOfIssue")}</FieldLabel>
                <Input {...field} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="issueDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t("invoices.form.issueDate")}</FieldLabel>
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
                        {field.value ? format(field.value, "PPP") : <span>{t("invoices.form.pickDate")}</span>}
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
                  <FieldLabel>{t("invoices.form.dueDate")}</FieldLabel>
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
                        {field.value ? format(field.value, "PPP") : <span>{t("invoices.form.pickDate")}</span>}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Controller
                name="exchangeRate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("invoices.form.exchangeRate")}</FieldLabel>
                    <Input
                      type="number"
                      step="0.0001"
                      inputMode="decimal"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(parseNumericInput(e.target.value))}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            )}
          </div>

          <Controller
            name="domesticSupply"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-start gap-2 py-2">
                <Checkbox
                  id="domesticSupply"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
                <div className="grid gap-0.5">
                  <label
                    htmlFor="domesticSupply"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {t("invoices.form.domesticSupply")}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t("invoices.form.domesticSupplyHint")}
                  </p>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t("invoices.form.items")}</h3>
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">{t("invoices.form.description")}</TableHead>
              <TableHead className="w-[15%]">{t("invoices.form.quantity")}</TableHead>
              <TableHead className="w-[20%]">{t("invoices.form.price")}</TableHead>
              <TableHead className="w-[20%]">{t("invoices.form.total")}</TableHead>
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
                    <Controller
                      name={`items.${index}.quantity`}
                      control={form.control}
                      render={({ field: qField }) => (
                        <Input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          value={Number.isFinite(qField.value) ? qField.value : ""}
                          onChange={(e) => qField.onChange(parseNumericInput(e.target.value))}
                          aria-invalid={!!itemErrors?.quantity}
                        />
                      )}
                    />
                    {itemErrors?.quantity?.message && (
                      <p className="mt-1 text-xs text-destructive">
                        {itemErrors.quantity.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`items.${index}.unitPrice`}
                      control={form.control}
                      render={({ field: pField }) => (
                        <Input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          value={Number.isFinite(pField.value) ? pField.value : ""}
                          onChange={(e) => pField.onChange(parseNumericInput(e.target.value))}
                          aria-invalid={!!itemErrors?.unitPrice}
                        />
                      )}
                    />
                    {itemErrors?.unitPrice?.message && (
                      <p className="mt-1 text-xs text-destructive">
                        {itemErrors.unitPrice.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="font-medium pt-3">
                    {rowTotal.toLocaleString()}
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

      <div className="flex flex-col items-end space-y-2 border-t pt-4">
        <div className="text-sm text-muted-foreground italic">
          {t("invoices.form.noVatNotice")}
        </div>
        <div className="text-2xl font-bold">
          {t("invoices.form.grandTotal")}: {totalAmount.toLocaleString()} {currency}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Spinner className="mr-2" />}
        {submitLabel ?? t("invoices.form.submit")}
      </Button>
    </form>
  );
};

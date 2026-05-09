import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Plus, Trash2, CalendarIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { Checkbox } from "@/shared/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";

import { useClients } from "@/entities/client/api/client.queries";
import { useBankAccounts } from "@/entities/bank-account/api/bank-account.queries";
import type { ICreateInvoiceRequest, Currency } from "@preduzetnik/shared";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  bankAccountId: z.string().min(1, "Bank account is required"),
  issueDate: z.date(),
  dueDate: z.date(),
  placeOfIssue: z.string().min(1, "Place of issue is required"),
  domesticSupply: z.boolean().default(true),
  currency: z.enum(["RSD", "EUR", "USD"]),
  exchangeRate: z.number().optional(),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(0.01, "Quantity must be > 0"),
    unitPrice: z.number().min(0, "Price must be >= 0"),
  })).min(1, "At least one item is required"),
  note: z.string().optional(),
}).refine((data) => {
  if (data.currency !== "RSD" && !data.exchangeRate) {
    return false;
  }
  return true;
}, {
  message: "Exchange rate is required for foreign currency",
  path: ["exchangeRate"],
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface CreateInvoiceFormProps {
  onSubmit: (data: ICreateInvoiceRequest) => void;
  isLoading?: boolean;
}

export const CreateInvoiceForm = ({ onSubmit, isLoading }: CreateInvoiceFormProps) => {
  const { t } = useTranslation();
  const { data: clients } = useClients();
  const { data: bankAccounts } = useBankAccounts();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issueDate: new Date(),
      dueDate: new Date(),
      placeOfIssue: "Beograd",
      domesticSupply: true,
      currency: "RSD",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const currency = form.watch("currency");
  const totalAmount = watchedItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  const handleFormSubmit = (values: InvoiceFormValues) => {
    const requestData: ICreateInvoiceRequest = {
      ...values,
      issueDate: values.issueDate.toISOString(),
      dueDate: values.dueDate.toISOString(),
      currency: values.currency as Currency,
      items: values.items.map(item => ({
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
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
                <Input {...field} />
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
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("invoices.form.issueDate")}</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              )}
            />
            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("invoices.form.dueDate")}</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      value={field.value || ""} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))} 
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
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="domesticSupply" 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
                <label 
                  htmlFor="domesticSupply" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("invoices.form.domesticSupply")}
                </label>
              </div>
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t("invoices.form.items")}</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
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
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <Input {...form.register(`items.${index}.description`)} />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} 
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })} 
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {(watchedItems[index]?.quantity * watchedItems[index]?.unitPrice || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-end space-y-2 border-t pt-4">
        <div className="text-sm text-muted-foreground italic">
          {t("invoices.form.noVatNotice", { defaultValue: "Nije u sistemu PDV-a" })}
        </div>
        <div className="text-2xl font-bold">
          {t("invoices.form.grandTotal")}: {totalAmount.toLocaleString()} {form.watch("currency")}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "..." : t("invoices.form.submit")}
      </Button>
    </form>
  );
};

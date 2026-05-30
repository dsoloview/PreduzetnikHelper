import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import type { Currency } from "@preduzetnik/shared";

import { Input } from "@/shared/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { RequiredMark } from "@/shared/ui/required-mark";

const bankAccountSchema = (t: (key: string) => string) => z.object({
  bankName: z.string().min(1, t("bankAccounts.errors.bankNameRequired")),
  accountNumber: z.string().min(1, t("bankAccounts.errors.accountNumberRequired")),
  swiftCode: z.string().optional().or(z.literal("")),
  iban: z.string().optional().or(z.literal("")),
  currency: z.enum(["RSD", "EUR", "USD"]),
  isDefault: z.boolean().optional(),
});

export type BankAccountFormValues = z.infer<ReturnType<typeof bankAccountSchema>>;

/** Convert empty optional strings to undefined so they are omitted from the request. */
const stripEmptyOptionals = (data: BankAccountFormValues): BankAccountFormValues => ({
  ...data,
  swiftCode: data.swiftCode?.trim() ? data.swiftCode.trim() : undefined,
  iban: data.iban?.trim() ? data.iban.trim() : undefined,
});

interface BankAccountFormProps {
  onSubmit: (data: BankAccountFormValues) => void;
  defaultValues?: Partial<BankAccountFormValues>;
  isLoading?: boolean;
}

export const BankAccountForm = ({ onSubmit, defaultValues, isLoading }: BankAccountFormProps) => {
  const { t } = useTranslation();

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema(t)),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      swiftCode: "",
      iban: "",
      currency: "RSD",
      isDefault: false,
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit((data) => onSubmit(stripEmptyOptionals(data)));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Controller
          name="bankName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t("bankAccounts.form.bankName")}<RequiredMark /></FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="accountNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t("bankAccounts.form.accountNumber")}<RequiredMark /></FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={t("bankAccounts.form.accountNumberHint")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="swiftCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("bankAccounts.form.swiftCode")}</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder={t("bankAccounts.form.swiftPlaceholder")}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="iban"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("bankAccounts.form.iban")}</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder={t("bankAccounts.form.ibanPlaceholder")}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="currency"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("bankAccounts.form.currency")}<RequiredMark /></FieldLabel>
              <Select
                onValueChange={(val) => field.onChange(val as Currency)}
                value={field.value}
              >
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

        <Controller
          name="isDefault"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="isDefault"
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
              <FieldLabel htmlFor="isDefault" className="cursor-pointer">
                {t("bankAccounts.form.isDefault")}
              </FieldLabel>
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Spinner className="mr-2" />}
        {t("bankAccounts.form.submit")}
      </Button>
    </form>
  );
};

import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import type { Currency } from "@preduzetnik/shared";

import { Input } from "@/shared/ui/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/ui/field";
import { Checkbox } from "@/shared/ui/checkbox";
import { RequiredMark } from "@/shared/ui/required-mark";
import { ChoiceCards, FormActions, FormSection, type ChoiceOption } from "@/shared/ui/form-layout";

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
  const currency = useWatch({ control: form.control, name: "currency" });
  const isForeign = currency !== "RSD";

  const currencyOptions: ChoiceOption<Currency>[] = [
    { value: "RSD", label: "RSD", description: t("bankAccounts.form.currencyHint.rsd") },
    { value: "EUR", label: "EUR", description: t("bankAccounts.form.currencyHint.foreign") },
    { value: "USD", label: "USD", description: t("bankAccounts.form.currencyHint.foreign") },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title={t("bankAccounts.form.sections.bank")} description={t("bankAccounts.form.sections.bankDesc")}>
        <Controller
          name="bankName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
              <FieldLabel>{t("bankAccounts.form.bankName")}<RequiredMark /></FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} placeholder={t("bankAccounts.form.bankNamePlaceholder")} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="currency"
          control={form.control}
          render={({ field }) => (
            <Field className="sm:col-span-2">
              <FieldLabel>{t("bankAccounts.form.currency")}<RequiredMark /></FieldLabel>
              <ChoiceCards
                ariaLabel={t("bankAccounts.form.currency")}
                value={field.value}
                onChange={field.onChange}
                options={currencyOptions}
                className="sm:grid-cols-3"
              />
            </Field>
          )}
        />
      </FormSection>

      <FormSection
        title={t("bankAccounts.form.sections.details")}
        description={isForeign ? t("bankAccounts.form.sections.detailsDescForeign") : t("bankAccounts.form.sections.detailsDesc")}
      >
        <Controller
          name="accountNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
              <FieldLabel>{t("bankAccounts.form.accountNumber")}<RequiredMark /></FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="160-0000000123456-78"
                inputMode="numeric"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>{t("bankAccounts.form.accountNumberHint")}</FieldDescription>
              )}
            </Field>
          )}
        />
        <Controller
          name="iban"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {t("bankAccounts.form.iban")}
                {!isForeign && <span className="font-normal text-muted-foreground">{t("app.optional")}</span>}
              </FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} placeholder={t("bankAccounts.form.ibanPlaceholder")} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="swiftCode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {t("bankAccounts.form.swiftCode")}
                {!isForeign && <span className="font-normal text-muted-foreground">{t("app.optional")}</span>}
              </FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} placeholder={t("bankAccounts.form.swiftPlaceholder")} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FormSection>

      <Controller
        name="isDefault"
        control={form.control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
            <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} className="mt-0.5" />
            <span>
              <span className="block text-sm font-medium">{t("bankAccounts.form.isDefault")}</span>
              <span className="block text-xs text-muted-foreground">{t("bankAccounts.form.isDefaultHint")}</span>
            </span>
          </label>
        )}
      />

      <FormActions submitLabel={t("bankAccounts.form.submit")} isLoading={isLoading} />
    </form>
  );
};

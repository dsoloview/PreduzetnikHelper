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
import { Label } from "@/shared/ui/label";

const bankAccountSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  swiftCode: z.string().optional().or(z.literal("")),
  iban: z.string().optional().or(z.literal("")),
  currency: z.enum(["RSD", "EUR", "USD"]),
  isDefault: z.boolean().optional(),
});

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  onSubmit: (data: BankAccountFormValues) => void;
  defaultValues?: Partial<BankAccountFormValues>;
  isLoading?: boolean;
}

export const BankAccountForm = ({ onSubmit, defaultValues, isLoading }: BankAccountFormProps) => {
  const { t } = useTranslation();

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          name="bankName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t("bankAccounts.form.bankName")}</FieldLabel>
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
              <FieldLabel>{t("bankAccounts.form.accountNumber")}</FieldLabel>
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
                  placeholder="BKBMRS22"
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
                  placeholder="RS35160005080003520714"
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
              <FieldLabel>{t("bankAccounts.form.currency")}</FieldLabel>
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
            <div className="flex items-center gap-2">
              <Checkbox
                id="isDefault"
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                {t("bankAccounts.form.isDefault")}
              </Label>
            </div>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "..." : t("bankAccounts.form.submit")}
      </Button>
    </form>
  );
};

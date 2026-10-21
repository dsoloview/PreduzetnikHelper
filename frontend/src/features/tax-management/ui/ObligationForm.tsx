import type { ComponentProps } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/ui/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/ui/field";
import { RequiredMark } from "@/shared/ui/required-mark";
import { FormActions, FormSection } from "@/shared/ui/form-layout";
import { emptyObligationValues, parseAmount, type ObligationFormValues } from "../lib/obligation-form";

const obligationSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().trim().min(1, t("taxes.form.errors.required")).max(100),
      amount: z.string().refine((value) => parseAmount(value) > 0, t("taxes.form.errors.amount")),
      recipientName: z.string().trim().min(1, t("taxes.form.errors.required")).max(70),
      recipientAccount: z.string().trim().regex(/^[\d-]{18,20}$/, t("taxes.form.errors.account")),
      paymentCode: z.string().trim().regex(/^[12]\d{2}$/, t("taxes.form.errors.paymentCode")),
      model: z.string().trim().regex(/^\d{2}$/, t("taxes.form.errors.model")),
      reference: z.string().trim().regex(/^[\d-]{1,23}$/, t("taxes.form.errors.reference")),
      purpose: z.string().trim().max(35),
      start: z.string().regex(/^\d{4}-\d{2}$/, t("taxes.form.errors.required")),
      end: z.string(),
    })
    .refine((values) => !values.end || values.end >= values.start, {
      path: ["end"],
      message: t("taxes.form.errors.endBeforeStart"),
    });

const NAME_PRESETS = ["Porez na prihode", "Doprinos za PIO", "Doprinos za zdravstvo", "Doprinos za nezaposlenost"];

interface TextFieldProps {
  control: Control<ObligationFormValues>;
  name: keyof ObligationFormValues;
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  inputProps?: ComponentProps<typeof Input>;
}

const TextField = ({ control, name, label, hint, required, className, inputProps }: TextFieldProps) => {
  const { t } = useTranslation();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel>
            {label}
            {required ? <RequiredMark /> : <span className="font-normal text-muted-foreground">{t("app.optional")}</span>}
          </FieldLabel>
          <Input {...field} {...inputProps} aria-invalid={fieldState.invalid} />
          {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : hint && <FieldDescription>{hint}</FieldDescription>}
        </Field>
      )}
    />
  );
};

interface ObligationFormProps {
  onSubmit: (values: ObligationFormValues) => void;
  defaultValues?: ObligationFormValues;
  isLoading?: boolean;
}

export const ObligationForm = ({ onSubmit, defaultValues, isLoading }: ObligationFormProps) => {
  const { t } = useTranslation();
  const form = useForm<ObligationFormValues>({
    resolver: zodResolver(obligationSchema(t)),
    defaultValues: defaultValues ?? emptyObligationValues(),
  });
  const { control } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title={t("taxes.form.sections.what")} description={t("taxes.form.sections.whatDesc")}>
        <TextField
          control={control}
          name="name"
          label={t("taxes.form.name")}
          required
          className="sm:col-span-2"
          inputProps={{ placeholder: t("taxes.form.namePlaceholder"), list: "tax-obligation-names" }}
        />
        <datalist id="tax-obligation-names">
          {NAME_PRESETS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <TextField
          control={control}
          name="amount"
          label={t("taxes.form.amount")}
          required
          inputProps={{ inputMode: "decimal", placeholder: "6.500,00" }}
        />
      </FormSection>

      <FormSection title={t("taxes.form.sections.payment")} description={t("taxes.form.sections.paymentDesc")}>
        <TextField
          control={control}
          name="recipientName"
          label={t("taxes.form.recipientName")}
          required
          inputProps={{ placeholder: t("taxes.form.recipientNamePlaceholder") }}
        />
        <TextField
          control={control}
          name="recipientAccount"
          label={t("taxes.form.recipientAccount")}
          required
          inputProps={{ placeholder: "840-0000000000000-00", inputMode: "numeric" }}
        />
        <TextField
          control={control}
          name="model"
          label={t("taxes.form.model")}
          required
          inputProps={{ inputMode: "numeric", maxLength: 2 }}
        />
        <TextField
          control={control}
          name="reference"
          label={t("taxes.form.reference")}
          hint={t("taxes.form.referenceHint")}
          required
          inputProps={{ inputMode: "numeric" }}
        />
        <TextField
          control={control}
          name="paymentCode"
          label={t("taxes.form.paymentCode")}
          hint={t("taxes.form.paymentCodeHint")}
          required
          inputProps={{ inputMode: "numeric", maxLength: 3 }}
        />
        <TextField
          control={control}
          name="purpose"
          label={t("taxes.form.purpose")}
          hint={t("taxes.form.purposeHint")}
          inputProps={{ maxLength: 35 }}
        />
      </FormSection>

      <FormSection title={t("taxes.form.sections.period")} description={t("taxes.form.sections.periodDesc")}>
        <TextField control={control} name="start" label={t("taxes.form.start")} required inputProps={{ type: "month" }} />
        <TextField
          control={control}
          name="end"
          label={t("taxes.form.end")}
          hint={t("taxes.form.endHint")}
          inputProps={{ type: "month" }}
        />
      </FormSection>

      <FormActions submitLabel={t("taxes.form.submit")} isLoading={isLoading} />
    </form>
  );
};

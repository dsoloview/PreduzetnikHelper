import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/ui/input";
import { Building2, Globe } from "lucide-react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/ui/field";
import { RequiredMark } from "@/shared/ui/required-mark";
import { ChoiceCards, FormActions, FormSection, type ChoiceOption } from "@/shared/ui/form-layout";

const clientSchema = (t: (key: string) => string) => z.object({
  type: z.enum(["DOMESTIC", "INTERNATIONAL"]),
  name: z.string().min(1, t("clients.errors.nameRequired")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().min(1, t("clients.errors.addressRequired")),
  city: z.string().min(1, t("clients.errors.cityRequired")),
  postalCode: z.string().optional(),
  country: z.string().min(1, t("clients.errors.countryRequired")),
  taxId: z.string().min(1, t("clients.errors.taxIdRequired")),
  registrationNumber: z.string().min(1, t("clients.errors.registrationNumberRequired")),
});

/**
 * Backend validators like `@IsOptional() @IsPhoneNumber()` treat an empty string
 * as a present value and fail validation. Convert empty optional strings to
 * undefined so the field is omitted from the request payload.
 */
const stripEmptyOptionals = (data: ClientFormValues): ClientFormValues => ({
  ...data,
  email: data.email?.trim() ? data.email.trim() : undefined,
  phone: data.phone?.trim() ? data.phone.trim() : undefined,
  postalCode: data.postalCode?.trim() ? data.postalCode.trim() : undefined,
});

export type ClientFormValues = z.infer<ReturnType<typeof clientSchema>>;

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => void;
  defaultValues?: Partial<ClientFormValues>;
  isLoading?: boolean;
}

export const ClientForm = ({ onSubmit, defaultValues, isLoading }: ClientFormProps) => {
  const { t } = useTranslation();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema(t)),
    defaultValues: {
      type: "DOMESTIC",
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "RS",
      taxId: "",
      registrationNumber: "",
      ...defaultValues,
    },
  });

  const clientType = useWatch({ control: form.control, name: "type" });
  const isDomestic = clientType === "DOMESTIC";

  const handleSubmit = form.handleSubmit((data) => onSubmit(stripEmptyOptionals(data)));

  const typeOptions: ChoiceOption<ClientFormValues["type"]>[] = [
    { value: "DOMESTIC", label: t("clients.type.domestic"), description: t("clients.form.typeHint.domestic"), icon: Building2 },
    { value: "INTERNATIONAL", label: t("clients.type.international"), description: t("clients.form.typeHint.international"), icon: Globe },
  ];

  /** Switching to a foreign client clears the default "RS" so the country gets filled in */
  const changeType = (type: ClientFormValues["type"], onChange: (value: ClientFormValues["type"]) => void) => {
    onChange(type);
    const country = form.getValues("country");
    if (type === "INTERNATIONAL" && country === "RS") form.setValue("country", "");
    if (type === "DOMESTIC" && !country) form.setValue("country", "RS");
  };

  const textField = (
    name: "name" | "taxId" | "registrationNumber" | "address" | "city" | "postalCode" | "country" | "email" | "phone",
    label: string,
    { required = false, hint, placeholder, wide = false, type, inputMode }: {
      required?: boolean;
      hint?: string;
      placeholder?: string;
      wide?: boolean;
      type?: string;
      inputMode?: "numeric" | "email" | "tel";
    } = {},
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={wide ? "sm:col-span-2" : undefined}>
          <FieldLabel>
            {label}
            {required && <RequiredMark />}
          </FieldLabel>
          <Input {...field} type={type} inputMode={inputMode} placeholder={placeholder} aria-invalid={fieldState.invalid} />
          {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : hint && <FieldDescription>{hint}</FieldDescription>}
        </Field>
      )}
    />
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Controller
        name="type"
        control={form.control}
        render={({ field }) => (
          <ChoiceCards
            ariaLabel={t("clients.form.type")}
            value={field.value}
            onChange={(type) => changeType(type, field.onChange)}
            options={typeOptions}
            className="sm:grid-cols-2"
          />
        )}
      />

      <FormSection title={t("clients.form.sections.company")} description={t("clients.form.sections.companyDesc")}>
        {textField("name", t("clients.form.name"), { required: true, wide: true })}
        {textField("taxId", isDomestic ? t("clients.form.pib") : t("clients.form.taxId"), {
          required: true,
          hint: isDomestic ? t("clients.form.pibHint") : t("clients.form.taxIdHint"),
          placeholder: isDomestic ? "123456789" : "DE123456789",
          inputMode: isDomestic ? "numeric" : undefined,
        })}
        {textField("registrationNumber", isDomestic ? t("clients.form.mbr") : t("clients.form.registrationNumber"), {
          required: true,
          hint: isDomestic ? t("clients.form.mbrHint") : t("clients.form.registrationNumberHint"),
          placeholder: isDomestic ? "12345678" : undefined,
          inputMode: isDomestic ? "numeric" : undefined,
        })}
      </FormSection>

      <FormSection title={t("clients.form.sections.address")} description={t("clients.form.sections.addressDesc")}>
        {textField("address", t("clients.form.address"), { required: true, wide: true, placeholder: t("clients.form.addressPlaceholder") })}
        {textField("city", t("clients.form.city"), { required: true })}
        {textField("postalCode", t("clients.form.postalCode"))}
        {textField("country", t("clients.form.country"), {
          required: true,
          hint: t("clients.form.countryHint"),
          placeholder: isDomestic ? "RS" : "DE",
        })}
      </FormSection>

      <FormSection title={t("clients.form.sections.contacts")} description={t("clients.form.sections.contactsDesc")}>
        {textField("email", t("clients.form.email"), { type: "email", inputMode: "email", placeholder: "billing@company.com" })}
        {textField("phone", t("clients.form.phone"), { inputMode: "tel", placeholder: t("clients.form.phoneHint") })}
      </FormSection>

      <FormActions submitLabel={t("clients.form.submit")} isLoading={isLoading} />
    </form>
  );
};

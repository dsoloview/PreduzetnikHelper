import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { RequiredMark } from "@/shared/ui/required-mark";

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

  const clientType = form.watch("type");

  const handleSubmit = form.handleSubmit((data) => onSubmit(stripEmptyOptionals(data)));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("clients.form.type")}</FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOMESTIC">{t("clients.type.domestic")}</SelectItem>
                  <SelectItem value="INTERNATIONAL">{t("clients.type.international")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field aria-required data-invalid={fieldState.invalid}>
              <FieldLabel>{t("clients.form.name")}<RequiredMark /></FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="taxId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  {clientType === "DOMESTIC" ? t("clients.form.pib") : t("clients.form.taxId")}
                  <RequiredMark />
                </FieldLabel>
                <Input {...field} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="registrationNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("clients.form.mbr")}<RequiredMark /></FieldLabel>
                <Input {...field} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("clients.form.email")}</FieldLabel>
                <Input {...field} type="email" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("clients.form.phone")}</FieldLabel>
                <Input
                  {...field}
                  placeholder={t("clients.form.phoneHint")}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="address"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t("clients.form.address")}<RequiredMark /></FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("clients.form.city")}<RequiredMark /></FieldLabel>
                <Input {...field} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="postalCode"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("clients.form.postalCode")}</FieldLabel>
                <Input {...field} />
              </Field>
            )}
          />
          <Controller
            name="country"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("clients.form.country")}<RequiredMark /></FieldLabel>
                <Input {...field} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Spinner className="mr-2" />}
        {t("clients.form.submit")}
      </Button>
    </form>
  );
};

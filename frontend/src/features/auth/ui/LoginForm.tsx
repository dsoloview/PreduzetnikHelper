import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";
import { Spinner } from "@/shared/ui/spinner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { RequiredMark } from "@/shared/ui/required-mark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { getApiErrorMessage } from "@/shared/lib/api-error";

import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/entities/user/model/auth.store";

export const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const loginSchema = z.object({
    email: z.string().min(1, t("auth.login.errors.required")).email(t("auth.login.errors.email")),
    password: z.string().min(8, t("auth.login.errors.passwordMin")),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.accessToken);
      toast.success(t("auth.login.success", { defaultValue: "Successfully logged in!" }));
      navigate("/");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("auth.login.title")}</CardTitle>
        <CardDescription>{t("auth.login.description")}</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">{t("auth.login.email")}<RequiredMark /></FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">{t("auth.login.password")}<RequiredMark /></FieldLabel>
                  <PasswordInput
                    {...field}
                    id="password"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Spinner className="mr-2" />}
            {t("auth.login.submit")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/register")}
            disabled={isPending}
          >
            {t("auth.login.goToRegister", { defaultValue: "Don't have an account? Register" })}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

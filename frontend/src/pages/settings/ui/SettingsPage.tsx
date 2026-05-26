import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useChangePassword } from "@/entities/user/api/user.queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { PasswordInput } from "@/shared/ui/password-input";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { Label } from "@/shared/ui/label";
import { RequiredMark } from "@/shared/ui/required-mark";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { mutate, isPending } = useChangePassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.success(t("settings.password.success"));
          form.reset();
        },
        onError: (error: unknown) => {
          const axiosError = error as { response?: { data?: { message?: string } } };
          const msg = axiosError.response?.data?.message;
          if (msg === "Current password is incorrect") {
            form.setError("currentPassword", { message: t("settings.password.wrongCurrent") });
          } else {
            toast.error(t("settings.password.error"));
          }
        },
      },
    );
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("settings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.password.title")}</CardTitle>
          <CardDescription>{t("settings.password.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="currentPassword">{t("settings.password.current")}<RequiredMark /></Label>
              <PasswordInput
                id="currentPassword"
                {...form.register("currentPassword")}
              />
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="newPassword">{t("settings.password.new")}<RequiredMark /></Label>
              <PasswordInput
                id="newPassword"
                {...form.register("newPassword")}
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">{t("settings.password.confirm")}<RequiredMark /></Label>
              <PasswordInput
                id="confirmPassword"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner className="mr-2" />}
              {t("settings.password.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/*<Separator />*/}

      {/*<Card className="border-destructive/50">*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle className="text-base text-destructive">{t("settings.danger.title")}</CardTitle>*/}
      {/*    <CardDescription>{t("settings.danger.description")}</CardDescription>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent>*/}
      {/*    <Button variant="destructive" onClick={logout}>*/}
      {/*      {t("settings.danger.logout")}*/}
      {/*    </Button>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}
    </div>
  );
};

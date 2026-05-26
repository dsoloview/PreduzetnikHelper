import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useProfile, useUpdateProfile } from "@/entities/user/api/user.queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { Label } from "@/shared/ui/label";
import { RequiredMark } from "@/shared/ui/required-mark";
import { Skeleton } from "@/shared/ui/skeleton";
import { Separator } from "@/shared/ui/separator";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyName: z.string().optional(),
  pib: z.string().optional(),
  mbr: z.string().optional(),
  activityCode: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  municipality: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useProfile();
  const { mutate, isPending } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      companyName: "",
      pib: "",
      mbr: "",
      activityCode: "",
      address: "",
      city: "",
      postalCode: "",
      municipality: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? "",
        companyName: profile.companyName ?? "",
        pib: profile.pib ?? "",
        mbr: profile.mbr ?? "",
        activityCode: profile.activityCode ?? "",
        address: profile.address ?? "",
        city: profile.city ?? "",
        postalCode: profile.postalCode ?? "",
        municipality: profile.municipality ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile, form]);

  const onSubmit = (values: ProfileFormValues) => {
    const dto = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? undefined : v]),
    ) as ProfileFormValues;

    mutate(dto, {
      onSuccess: () => toast.success(t("profile.saveSuccess")),
      onError: () => toast.error(t("profile.saveError")),
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("profile.subtitle")}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("profile.sections.account")}</CardTitle>
            <CardDescription>{t("profile.sections.accountDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">{t("profile.fields.name")}<RequiredMark /></Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label className="text-muted-foreground text-sm">{t("profile.fields.email")}</Label>
              <Input value={profile?.email ?? ""} disabled className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("profile.sections.business")}</CardTitle>
            <CardDescription>{t("profile.sections.businessDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="companyName">{t("profile.fields.companyName")}</Label>
              <Input id="companyName" {...form.register("companyName")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="pib">{t("profile.fields.pib")}</Label>
                <Input id="pib" {...form.register("pib")} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="mbr">{t("profile.fields.mbr")}</Label>
                <Input id="mbr" {...form.register("mbr")} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="activityCode">{t("profile.fields.activityCode")}</Label>
              <Input id="activityCode" {...form.register("activityCode")} placeholder="e.g. 6201" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">{t("profile.fields.phone")}</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("profile.sections.address")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="address">{t("profile.fields.address")}</Label>
              <Input id="address" {...form.register("address")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="city">{t("profile.fields.city")}</Label>
                <Input id="city" {...form.register("city")} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="postalCode">{t("profile.fields.postalCode")}</Label>
                <Input id="postalCode" {...form.register("postalCode")} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="municipality">{t("profile.fields.municipality")}</Label>
                <Input id="municipality" {...form.register("municipality")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="mr-2" />}
            {t("profile.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { DialogClose, DialogFooter } from "@/shared/ui/dialog";
import { Spinner } from "@/shared/ui/spinner";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const FormSection = ({ title, description, children }: FormSectionProps) => (
  <section className="space-y-3">
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </section>
);

interface FormActionsProps {
  submitLabel: string;
  isLoading?: boolean;
}

export const FormActions = ({ submitLabel, isLoading }: FormActionsProps) => {
  const { t } = useTranslation();
  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button type="button" variant="outline" disabled={isLoading}>
          {t("app.cancel")}
        </Button>
      </DialogClose>
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Spinner className="mr-2" />}
        {submitLabel}
      </Button>
    </DialogFooter>
  );
};

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface ChoiceCardsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  ariaLabel: string;
  className?: string;
}

export const ChoiceCards = <T extends string>({ value, onChange, options, ariaLabel, className }: ChoiceCardsProps<T>) => (
  <div role="radiogroup" aria-label={ariaLabel} className={cn("grid gap-2", className)}>
    {options.map(({ value: optionValue, label, description, icon: Icon }) => {
      const selected = optionValue === value;
      return (
        <button
          key={optionValue}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(optionValue)}
          className={cn(
            "relative flex items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            selected ? "border-primary bg-accent/60" : "border-input hover:bg-muted/60",
          )}
        >
          {Icon && (
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md",
                selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
          )}
          <span className="min-w-0 pr-5">
            <span className="block text-sm font-medium">{label}</span>
            {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
          </span>
          {selected && <Check className="absolute top-3 right-3 size-4 text-primary" />}
        </button>
      );
    })}
  </div>
);

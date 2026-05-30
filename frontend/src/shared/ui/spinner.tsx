import { Loader2Icon, type LucideProps } from "lucide-react"
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils"

function Spinner({ className, ...props }: LucideProps) {
  const { t } = useTranslation();
  return (
    <Loader2Icon
      role="status"
      aria-label={t("app.loadingAria")}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

interface QrCodeProps {
  value: string;
  label: string;
  className?: string;
}

export const QrCode = ({ value, label, className }: QrCodeProps) => {
  const [svg, setSvg] = useState<{ value: string; src: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(value, { type: "svg", margin: 2, errorCorrectionLevel: "M" })
      .then((markup) => {
        if (!cancelled) setSvg({ value, src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}` });
      })
      .catch(() => {
        if (!cancelled) setSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!svg || svg.value !== value) return <Skeleton className={cn("aspect-square", className)} />;
  return <img src={svg.src} alt={label} className={cn("aspect-square rounded-lg bg-white", className)} />;
};

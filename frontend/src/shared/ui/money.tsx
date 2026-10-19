import { cn } from "@/shared/lib/utils";
import { useFormatters, type FormatNumberOptions } from "@/shared/lib/format";

interface MoneyProps extends FormatNumberOptions {
  amount: number;
  currency: string;
  className?: string;
}

/** An amount with its currency code, never wrapped across lines */
export const Money = ({ amount, currency, decimals, className }: MoneyProps) => {
  const { money } = useFormatters();
  return <span className={cn("whitespace-nowrap tabular-nums", className)}>{money(amount, currency, { decimals })}</span>;
};

import { useTranslation } from "react-i18next";

/** Interface language → number locale. Serbian uses Latin script, matching the rest of the app */
const NUMBER_LOCALES: Record<string, string> = {
  ru: "ru-RU",
  en: "en-GB",
  sr: "sr-Latn-RS",
};

export const getNumberLocale = (language: string): string =>
  NUMBER_LOCALES[language.split("-")[0]] ?? "sr-Latn-RS";

export interface FormatNumberOptions {
  /** Fixed number of decimals; defaults to 2 for foreign currencies and 0 for whole RSD amounts */
  decimals?: number;
}

export const formatNumber = (value: number, locale: string, decimals = 2): string =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

/**
 * "1.234.567 RSD" / "4 200,00 EUR": the currency code always follows the number, so amounts look
 * the same in every language (Intl currency style would print "€" in English and "EUR" in Serbian).
 */
export const formatMoney = (
  amount: number,
  currency: string,
  locale: string,
  { decimals }: FormatNumberOptions = {},
): string => `${formatNumber(amount, locale, decimals ?? (currency === "RSD" ? 0 : 2))}\u00a0${currency}`;

/** Formatters bound to the current interface language */
export const useFormatters = () => {
  const { i18n } = useTranslation();
  const locale = getNumberLocale(i18n.language);
  return {
    locale,
    number: (value: number, decimals?: number) => formatNumber(value, locale, decimals),
    money: (amount: number, currency: string, options?: FormatNumberOptions) =>
      formatMoney(amount, currency, locale, options),
  };
};

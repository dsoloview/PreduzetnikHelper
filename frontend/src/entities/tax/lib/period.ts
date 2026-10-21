export const formatTaxPeriod = (year: number, month: number, locale: string): string =>
  new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));

export const formatIsoDate = (iso: string): string => {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
};

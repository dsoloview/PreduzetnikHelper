export const formatSerbianDate = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

export const stripTime = (date: Date): Date => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
};

export const getBelgradeYear = (date: Date): number => {
  return Number(
    new Intl.DateTimeFormat('en', {
      year: 'numeric',
      timeZone: 'Europe/Belgrade',
    }).format(date),
  );
};
/** [start, end) of a calendar year in Belgrade time. January 1st is always CET (UTC+1), so the year starts at 23:00 UTC on Dec 31. */
export const getBelgradeYearRange = (
  year: number,
): { start: Date; end: Date } => ({
  start: new Date(Date.UTC(year - 1, 11, 31, 23)),
  end: new Date(Date.UTC(year, 11, 31, 23)),
});

/** Date as printed on documents (sr-RS style) in Belgrade time, independent of the server timezone */
export const formatBelgradeDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('sr-RS', {
    timeZone: 'Europe/Belgrade',
  });
};

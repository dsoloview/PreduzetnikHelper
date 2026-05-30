export const formatSerbianDate = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};

export const stripTime = (date: Date): Date => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

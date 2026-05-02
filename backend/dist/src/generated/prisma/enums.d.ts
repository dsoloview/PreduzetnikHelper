export declare const Currency: {
    readonly RSD: "RSD";
    readonly EUR: "EUR";
    readonly USD: "USD";
};
export type Currency = (typeof Currency)[keyof typeof Currency];

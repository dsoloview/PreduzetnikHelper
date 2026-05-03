export declare const Currency: {
    readonly RSD: "RSD";
    readonly EUR: "EUR";
    readonly USD: "USD";
};
export type Currency = (typeof Currency)[keyof typeof Currency];
export declare const ClientType: {
    readonly DOMESTIC: "DOMESTIC";
    readonly INTERNATIONAL: "INTERNATIONAL";
};
export type ClientType = (typeof ClientType)[keyof typeof ClientType];
export declare const InvoiceStatus: {
    readonly DRAFT: "DRAFT";
    readonly SENT: "SENT";
    readonly PAID: "PAID";
    readonly CANCELLED: "CANCELLED";
};
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const PDF_SERVICE = 'PDF_SERVICE';

export interface InvoicePdfData {
    displayNumber: string;
    issueDate: string;
    dueDate: string;
    placeOfIssue: string;
    currency: string;
    exchangeRate: number | null;
    totalAmount: number;
    totalRsd: number;
    note: string | null;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    user: {
        companyName: string | null;
        name: string;
        address: string | null;
        postalCode: string | null;
        city: string | null;
        pib: string | null;
        mbr: string | null;
    };
    client: {
        name: string;
        address: string | null;
        postalCode: string | null;
        city: string | null;
        country: string | null;
        taxId: string | null;
        registrationNumber: string | null;
    };
    bankAccount: {
        bankName: string;
        accountNumber: string;
        swiftCode: string | null;
        iban: string | null;
    };
}

export interface KpoPdfData {
    year: number;
    totalYearly: number;
    entries: {
        sequenceNumber: number;
        issueDate: string;
        description: string;
        productAmount: number;
        serviceAmount: number;
        totalAmount: number;
    }[];
    user: {
        companyName: string | null;
        name: string;
        address: string | null;
        city: string | null;
        pib: string | null;
        mbr: string | null;
        activityCode: string | null;
    };
}

export interface IPdfService {
    generateInvoicePdf(data: InvoicePdfData): Promise<Buffer>;
    generateKpoPdf(data: KpoPdfData): Promise<Buffer>;
}

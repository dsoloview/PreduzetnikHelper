import {ClientType} from "./enums";

export interface IClient {
    id: string;
    type: ClientType;
    name: string;
    email: string | null;
    phone: string | null;
    address: string;
    city: string;
    country: string;
    taxId: string;
    registrationNumber: string;
    createdAt: Date;
}

export interface ICreateClientRequest {
    name: string;
    type: ClientType;
    email?: string;
    phone?: string;
    address: string;
    city: string;
    country: string;
    taxId: string;
    registrationNumber: string;
}

export interface IUpdateClientRequest extends Partial<ICreateClientRequest> {}

export interface IUserResponse {
    id: string;
    email: string;
    name: string;
    companyName: string | null;
    pib: string | null;
    mbr: string | null;
    activityCode: string | null;
    address: string | null;
    city: string | null;
    municipality: string | null;
    phone: string | null;
    createdAt: Date;
}

export interface IUpdateUserRequest {
    name?: string;
    companyName?: string;
    pib?: string;
    mbr?: string;
    activityCode?: string;
    address?: string;
    city?: string;
    municipality?: string;
    phone?: string;
}
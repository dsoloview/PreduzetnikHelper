import { IUserResponse } from "@preduzetnik/shared";
export declare class UserResponseDto implements IUserResponse {
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

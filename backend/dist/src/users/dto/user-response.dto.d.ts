import { IUserResponse } from "@preduzetnik/shared";
export declare class UserResponseDto implements IUserResponse {
    id: string;
    email: string;
    name: string;
    companyName: string | null;
    pib: string | null;
    createdAt: Date;
}

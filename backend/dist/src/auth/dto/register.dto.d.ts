import { IRegisterRequest } from "@preduzetnik/shared";
export declare class RegisterDto implements IRegisterRequest {
    email: string;
    password: string;
    name: string;
}

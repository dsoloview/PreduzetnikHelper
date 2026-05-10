export interface ILoginRequest {
    email: string;
    password: string;
}
export interface IRegisterRequest {
    email: string;
    password: string;
    name: string;
}
export interface IAuthResponse {
    accessToken: string;
}
export interface IChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
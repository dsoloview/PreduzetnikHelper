export interface IUserResponse {
    id: string;
    email: string;
    name: string;
    companyName: string | null;
    pib: string | null;
    createdAt: Date;
}
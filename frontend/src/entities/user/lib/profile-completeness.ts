import type {IUserResponse} from "@preduzetnik/shared";

/** Fields required to generate a complete invoice PDF. */
const REQUIRED_FIELDS: Array<keyof IUserResponse> = [
    "companyName",
    "pib",
    "address",
    "city",
    "mbr"
];

export const isMissingProfileDetails = (profile: IUserResponse): boolean =>
    REQUIRED_FIELDS.some((field) => !profile[field]);

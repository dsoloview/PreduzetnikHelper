import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client/runtime/client").DbNullClass;
export declare const JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
export declare const AnyNull: import("@prisma/client/runtime/client").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly BankAccount: "BankAccount";
    readonly Client: "Client";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly password: "password";
    readonly name: "name";
    readonly companyName: "companyName";
    readonly pib: "pib";
    readonly mbr: "mbr";
    readonly activityCode: "activityCode";
    readonly address: "address";
    readonly city: "city";
    readonly municipality: "municipality";
    readonly phone: "phone";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const BankAccountScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly bankName: "bankName";
    readonly accountNumber: "accountNumber";
    readonly currency: "currency";
    readonly isDefault: "isDefault";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BankAccountScalarFieldEnum = (typeof BankAccountScalarFieldEnum)[keyof typeof BankAccountScalarFieldEnum];
export declare const ClientScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly type: "type";
    readonly name: "name";
    readonly email: "email";
    readonly phone: "phone";
    readonly address: "address";
    readonly city: "city";
    readonly country: "country";
    readonly taxId: "taxId";
    readonly registrationNumber: "registrationNumber";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ClientScalarFieldEnum = (typeof ClientScalarFieldEnum)[keyof typeof ClientScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

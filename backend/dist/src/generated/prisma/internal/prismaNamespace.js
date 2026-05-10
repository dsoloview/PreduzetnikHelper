"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineExtension = exports.NullsOrder = exports.QueryMode = exports.SortOrder = exports.InvoiceItemScalarFieldEnum = exports.InvoiceScalarFieldEnum = exports.ClientScalarFieldEnum = exports.BankAccountScalarFieldEnum = exports.UserScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.prismaVersion = exports.getExtensionContext = exports.Decimal = exports.Sql = exports.raw = exports.join = exports.empty = exports.sql = exports.PrismaClientValidationError = exports.PrismaClientInitializationError = exports.PrismaClientRustPanicError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = void 0;
const runtime = __importStar(require("@prisma/client/runtime/client"));
exports.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
exports.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
exports.PrismaClientValidationError = runtime.PrismaClientValidationError;
exports.sql = runtime.sqltag;
exports.empty = runtime.empty;
exports.join = runtime.join;
exports.raw = runtime.raw;
exports.Sql = runtime.Sql;
exports.Decimal = runtime.Decimal;
exports.getExtensionContext = runtime.Extensions.getExtensionContext;
exports.prismaVersion = {
    client: "7.8.0",
    engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    User: 'User',
    BankAccount: 'BankAccount',
    Client: 'Client',
    Invoice: 'Invoice',
    InvoiceItem: 'InvoiceItem'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    password: 'password',
    name: 'name',
    companyName: 'companyName',
    pib: 'pib',
    mbr: 'mbr',
    activityCode: 'activityCode',
    address: 'address',
    city: 'city',
    postalCode: 'postalCode',
    municipality: 'municipality',
    phone: 'phone',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.BankAccountScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    bankName: 'bankName',
    accountNumber: 'accountNumber',
    swiftCode: 'swiftCode',
    iban: 'iban',
    currency: 'currency',
    isDefault: 'isDefault',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ClientScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    type: 'type',
    name: 'name',
    email: 'email',
    phone: 'phone',
    address: 'address',
    city: 'city',
    postalCode: 'postalCode',
    country: 'country',
    taxId: 'taxId',
    registrationNumber: 'registrationNumber',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.InvoiceScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    clientId: 'clientId',
    invoiceNumber: 'invoiceNumber',
    year: 'year',
    status: 'status',
    issueDate: 'issueDate',
    dueDate: 'dueDate',
    placeOfIssue: 'placeOfIssue',
    domesticSupply: 'domesticSupply',
    currency: 'currency',
    exchangeRate: 'exchangeRate',
    totalAmount: 'totalAmount',
    totalRsd: 'totalRsd',
    note: 'note',
    bankAccountId: 'bankAccountId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.InvoiceItemScalarFieldEnum = {
    id: 'id',
    invoiceId: 'invoiceId',
    description: 'description',
    quantity: 'quantity',
    unitPrice: 'unitPrice',
    total: 'total'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map
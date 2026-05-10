import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type UserModel = runtime.Types.Result.DefaultSelection<Prisma.$UserPayload>;
export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
export type UserMinAggregateOutputType = {
    id: string | null;
    email: string | null;
    password: string | null;
    name: string | null;
    companyName: string | null;
    pib: string | null;
    mbr: string | null;
    activityCode: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    municipality: string | null;
    phone: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type UserMaxAggregateOutputType = {
    id: string | null;
    email: string | null;
    password: string | null;
    name: string | null;
    companyName: string | null;
    pib: string | null;
    mbr: string | null;
    activityCode: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    municipality: string | null;
    phone: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type UserCountAggregateOutputType = {
    id: number;
    email: number;
    password: number;
    name: number;
    companyName: number;
    pib: number;
    mbr: number;
    activityCode: number;
    address: number;
    city: number;
    postalCode: number;
    municipality: number;
    phone: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type UserMinAggregateInputType = {
    id?: true;
    email?: true;
    password?: true;
    name?: true;
    companyName?: true;
    pib?: true;
    mbr?: true;
    activityCode?: true;
    address?: true;
    city?: true;
    postalCode?: true;
    municipality?: true;
    phone?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type UserMaxAggregateInputType = {
    id?: true;
    email?: true;
    password?: true;
    name?: true;
    companyName?: true;
    pib?: true;
    mbr?: true;
    activityCode?: true;
    address?: true;
    city?: true;
    postalCode?: true;
    municipality?: true;
    phone?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type UserCountAggregateInputType = {
    id?: true;
    email?: true;
    password?: true;
    name?: true;
    companyName?: true;
    pib?: true;
    mbr?: true;
    activityCode?: true;
    address?: true;
    city?: true;
    postalCode?: true;
    municipality?: true;
    phone?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type UserAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UserCountAggregateInputType;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUser[P]> : Prisma.GetScalarType<T[P], AggregateUser[P]>;
};
export type UserGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithAggregationInput | Prisma.UserOrderByWithAggregationInput[];
    by: Prisma.UserScalarFieldEnum[] | Prisma.UserScalarFieldEnum;
    having?: Prisma.UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type UserGroupByOutputType = {
    id: string;
    email: string;
    password: string;
    name: string;
    companyName: string | null;
    pib: string | null;
    mbr: string | null;
    activityCode: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    municipality: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
export type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]>;
}>>;
export type UserWhereInput = {
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    id?: Prisma.StringFilter<"User"> | string;
    email?: Prisma.StringFilter<"User"> | string;
    password?: Prisma.StringFilter<"User"> | string;
    name?: Prisma.StringFilter<"User"> | string;
    companyName?: Prisma.StringNullableFilter<"User"> | string | null;
    pib?: Prisma.StringNullableFilter<"User"> | string | null;
    mbr?: Prisma.StringNullableFilter<"User"> | string | null;
    activityCode?: Prisma.StringNullableFilter<"User"> | string | null;
    address?: Prisma.StringNullableFilter<"User"> | string | null;
    city?: Prisma.StringNullableFilter<"User"> | string | null;
    postalCode?: Prisma.StringNullableFilter<"User"> | string | null;
    municipality?: Prisma.StringNullableFilter<"User"> | string | null;
    phone?: Prisma.StringNullableFilter<"User"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    bankAccounts?: Prisma.BankAccountListRelationFilter;
    clients?: Prisma.ClientListRelationFilter;
    invoices?: Prisma.InvoiceListRelationFilter;
};
export type UserOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    companyName?: Prisma.SortOrderInput | Prisma.SortOrder;
    pib?: Prisma.SortOrderInput | Prisma.SortOrder;
    mbr?: Prisma.SortOrderInput | Prisma.SortOrder;
    activityCode?: Prisma.SortOrderInput | Prisma.SortOrder;
    address?: Prisma.SortOrderInput | Prisma.SortOrder;
    city?: Prisma.SortOrderInput | Prisma.SortOrder;
    postalCode?: Prisma.SortOrderInput | Prisma.SortOrder;
    municipality?: Prisma.SortOrderInput | Prisma.SortOrder;
    phone?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    bankAccounts?: Prisma.BankAccountOrderByRelationAggregateInput;
    clients?: Prisma.ClientOrderByRelationAggregateInput;
    invoices?: Prisma.InvoiceOrderByRelationAggregateInput;
};
export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    email?: string;
    pib?: string;
    mbr?: string;
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    password?: Prisma.StringFilter<"User"> | string;
    name?: Prisma.StringFilter<"User"> | string;
    companyName?: Prisma.StringNullableFilter<"User"> | string | null;
    activityCode?: Prisma.StringNullableFilter<"User"> | string | null;
    address?: Prisma.StringNullableFilter<"User"> | string | null;
    city?: Prisma.StringNullableFilter<"User"> | string | null;
    postalCode?: Prisma.StringNullableFilter<"User"> | string | null;
    municipality?: Prisma.StringNullableFilter<"User"> | string | null;
    phone?: Prisma.StringNullableFilter<"User"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    bankAccounts?: Prisma.BankAccountListRelationFilter;
    clients?: Prisma.ClientListRelationFilter;
    invoices?: Prisma.InvoiceListRelationFilter;
}, "id" | "email" | "pib" | "mbr">;
export type UserOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    companyName?: Prisma.SortOrderInput | Prisma.SortOrder;
    pib?: Prisma.SortOrderInput | Prisma.SortOrder;
    mbr?: Prisma.SortOrderInput | Prisma.SortOrder;
    activityCode?: Prisma.SortOrderInput | Prisma.SortOrder;
    address?: Prisma.SortOrderInput | Prisma.SortOrder;
    city?: Prisma.SortOrderInput | Prisma.SortOrder;
    postalCode?: Prisma.SortOrderInput | Prisma.SortOrder;
    municipality?: Prisma.SortOrderInput | Prisma.SortOrder;
    phone?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.UserCountOrderByAggregateInput;
    _max?: Prisma.UserMaxOrderByAggregateInput;
    _min?: Prisma.UserMinOrderByAggregateInput;
};
export type UserScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"User"> | string;
    email?: Prisma.StringWithAggregatesFilter<"User"> | string;
    password?: Prisma.StringWithAggregatesFilter<"User"> | string;
    name?: Prisma.StringWithAggregatesFilter<"User"> | string;
    companyName?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    pib?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    mbr?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    activityCode?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    address?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    city?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    postalCode?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    municipality?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    phone?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"User"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"User"> | Date | string;
};
export type UserCreateInput = {
    id?: string;
    email: string;
    password: string;
    name: string;
    companyName?: string | null;
    pib?: string | null;
    mbr?: string | null;
    activityCode?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    municipality?: string | null;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccounts?: Prisma.BankAccountCreateNestedManyWithoutUserInput;
    clients?: Prisma.ClientCreateNestedManyWithoutUserInput;
    invoices?: Prisma.InvoiceCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateInput = {
    id?: string;
    email: string;
    password: string;
    name: string;
    companyName?: string | null;
    pib?: string | null;
    mbr?: string | null;
    activityCode?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    municipality?: string | null;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccounts?: Prisma.BankAccountUncheckedCreateNestedManyWithoutUserInput;
    clients?: Prisma.ClientUncheckedCreateNestedManyWithoutUserInput;
    invoices?: Prisma.InvoiceUncheckedCreateNestedManyWithoutUserInput;
};
export type UserUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccounts?: Prisma.BankAccountUpdateManyWithoutUserNestedInput;
    clients?: Prisma.ClientUpdateManyWithoutUserNestedInput;
    invoices?: Prisma.InvoiceUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccounts?: Prisma.BankAccountUncheckedUpdateManyWithoutUserNestedInput;
    clients?: Prisma.ClientUncheckedUpdateManyWithoutUserNestedInput;
    invoices?: Prisma.InvoiceUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCreateManyInput = {
    id?: string;
    email: string;
    password: string;
    name: string;
    companyName?: string | null;
    pib?: string | null;
    mbr?: string | null;
    activityCode?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    municipality?: string | null;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    companyName?: Prisma.SortOrder;
    pib?: Prisma.SortOrder;
    mbr?: Prisma.SortOrder;
    activityCode?: Prisma.SortOrder;
    address?: Prisma.SortOrder;
    city?: Prisma.SortOrder;
    postalCode?: Prisma.SortOrder;
    municipality?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    companyName?: Prisma.SortOrder;
    pib?: Prisma.SortOrder;
    mbr?: Prisma.SortOrder;
    activityCode?: Prisma.SortOrder;
    address?: Prisma.SortOrder;
    city?: Prisma.SortOrder;
    postalCode?: Prisma.SortOrder;
    municipality?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    companyName?: Prisma.SortOrder;
    pib?: Prisma.SortOrder;
    mbr?: Prisma.SortOrder;
    activityCode?: Prisma.SortOrder;
    address?: Prisma.SortOrder;
    city?: Prisma.SortOrder;
    postalCode?: Prisma.SortOrder;
    municipality?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserScalarRelationFilter = {
    is?: Prisma.UserWhereInput;
    isNot?: Prisma.UserWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type UserCreateNestedOneWithoutBankAccountsInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutBankAccountsInput, Prisma.UserUncheckedCreateWithoutBankAccountsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutBankAccountsInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutBankAccountsNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutBankAccountsInput, Prisma.UserUncheckedCreateWithoutBankAccountsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutBankAccountsInput;
    upsert?: Prisma.UserUpsertWithoutBankAccountsInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutBankAccountsInput, Prisma.UserUpdateWithoutBankAccountsInput>, Prisma.UserUncheckedUpdateWithoutBankAccountsInput>;
};
export type UserCreateNestedOneWithoutClientsInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutClientsInput, Prisma.UserUncheckedCreateWithoutClientsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutClientsInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutClientsNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutClientsInput, Prisma.UserUncheckedCreateWithoutClientsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutClientsInput;
    upsert?: Prisma.UserUpsertWithoutClientsInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutClientsInput, Prisma.UserUpdateWithoutClientsInput>, Prisma.UserUncheckedUpdateWithoutClientsInput>;
};
export type UserCreateNestedOneWithoutInvoicesInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutInvoicesInput, Prisma.UserUncheckedCreateWithoutInvoicesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutInvoicesInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutInvoicesNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutInvoicesInput, Prisma.UserUncheckedCreateWithoutInvoicesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutInvoicesInput;
    upsert?: Prisma.UserUpsertWithoutInvoicesInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutInvoicesInput, Prisma.UserUpdateWithoutInvoicesInput>, Prisma.UserUncheckedUpdateWithoutInvoicesInput>;
};
export type UserCreateWithoutBankAccountsInput = {
    id?: string;
    email: string;
    password: string;
    name: string;
    companyName?: string | null;
    pib?: string | null;
    mbr?: string | null;
    activityCode?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    municipality?: string | null;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    clients?: Prisma.ClientCreateNestedManyWithoutUserInput;
    invoices?: Prisma.InvoiceCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateWithoutBankAccountsInput = {
    id?: string;
    email: string;
    password: string;
    name: string;
    companyName?: string | null;
    pib?: string | null;
    mbr?: string | null;
    activityCode?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    municipality?: string | null;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    clients?: Prisma.ClientUncheckedCreateNestedManyWithoutUserInput;
    invoices?: Prisma.InvoiceUncheckedCreateNestedManyWithoutUserInput;
};
export type UserCreateOrConnectWithoutBankAccountsInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutBankAccountsInput, Prisma.UserUncheckedCreateWithoutBankAccountsInput>;
};
export type UserUpsertWithoutBankAccountsInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutBankAccountsInput, Prisma.UserUncheckedUpdateWithoutBankAccountsInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutBankAccountsInput, Prisma.UserUncheckedCreateWithoutBankAccountsInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutBankAccountsInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutBankAccountsInput, Prisma.UserUncheckedUpdateWithoutBankAccountsInput>;
};
export type UserUpdateWithoutBankAccountsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clients?: Prisma.ClientUpdateManyWithoutUserNestedInput;
    invoices?: Prisma.InvoiceUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateWithoutBankAccountsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clients?: Prisma.ClientUncheckedUpdateManyWithoutUserNestedInput;
    invoices?: Prisma.InvoiceUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCreateWithoutClientsInput = {
    id?: string;
    email: string;
    password: string;
    name: string;
    companyName?: string | null;
    pib?: string | null;
    mbr?: string | null;
    activityCode?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    municipality?: string | null;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccounts?: Prisma.BankAccountCreateNestedManyWithoutUserInput;
    invoices?: Prisma.InvoiceCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateWithoutClientsInput = {
    id?: string;
    email: string;
    password: string;
    name: string;
    companyName?: string | null;
    pib?: string | null;
    mbr?: string | null;
    activityCode?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    municipality?: string | null;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccounts?: Prisma.BankAccountUncheckedCreateNestedManyWithoutUserInput;
    invoices?: Prisma.InvoiceUncheckedCreateNestedManyWithoutUserInput;
};
export type UserCreateOrConnectWithoutClientsInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutClientsInput, Prisma.UserUncheckedCreateWithoutClientsInput>;
};
export type UserUpsertWithoutClientsInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutClientsInput, Prisma.UserUncheckedUpdateWithoutClientsInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutClientsInput, Prisma.UserUncheckedCreateWithoutClientsInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutClientsInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutClientsInput, Prisma.UserUncheckedUpdateWithoutClientsInput>;
};
export type UserUpdateWithoutClientsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccounts?: Prisma.BankAccountUpdateManyWithoutUserNestedInput;
    invoices?: Prisma.InvoiceUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateWithoutClientsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccounts?: Prisma.BankAccountUncheckedUpdateManyWithoutUserNestedInput;
    invoices?: Prisma.InvoiceUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCreateWithoutInvoicesInput = {
    id?: string;
    email: string;
    password: string;
    name: string;
    companyName?: string | null;
    pib?: string | null;
    mbr?: string | null;
    activityCode?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    municipality?: string | null;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccounts?: Prisma.BankAccountCreateNestedManyWithoutUserInput;
    clients?: Prisma.ClientCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateWithoutInvoicesInput = {
    id?: string;
    email: string;
    password: string;
    name: string;
    companyName?: string | null;
    pib?: string | null;
    mbr?: string | null;
    activityCode?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    municipality?: string | null;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccounts?: Prisma.BankAccountUncheckedCreateNestedManyWithoutUserInput;
    clients?: Prisma.ClientUncheckedCreateNestedManyWithoutUserInput;
};
export type UserCreateOrConnectWithoutInvoicesInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutInvoicesInput, Prisma.UserUncheckedCreateWithoutInvoicesInput>;
};
export type UserUpsertWithoutInvoicesInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutInvoicesInput, Prisma.UserUncheckedUpdateWithoutInvoicesInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutInvoicesInput, Prisma.UserUncheckedCreateWithoutInvoicesInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutInvoicesInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutInvoicesInput, Prisma.UserUncheckedUpdateWithoutInvoicesInput>;
};
export type UserUpdateWithoutInvoicesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccounts?: Prisma.BankAccountUpdateManyWithoutUserNestedInput;
    clients?: Prisma.ClientUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateWithoutInvoicesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pib?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mbr?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    activityCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    postalCode?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    municipality?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccounts?: Prisma.BankAccountUncheckedUpdateManyWithoutUserNestedInput;
    clients?: Prisma.ClientUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCountOutputType = {
    bankAccounts: number;
    clients: number;
    invoices: number;
};
export type UserCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bankAccounts?: boolean | UserCountOutputTypeCountBankAccountsArgs;
    clients?: boolean | UserCountOutputTypeCountClientsArgs;
    invoices?: boolean | UserCountOutputTypeCountInvoicesArgs;
};
export type UserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserCountOutputTypeSelect<ExtArgs> | null;
};
export type UserCountOutputTypeCountBankAccountsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BankAccountWhereInput;
};
export type UserCountOutputTypeCountClientsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientWhereInput;
};
export type UserCountOutputTypeCountInvoicesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvoiceWhereInput;
};
export type UserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    password?: boolean;
    name?: boolean;
    companyName?: boolean;
    pib?: boolean;
    mbr?: boolean;
    activityCode?: boolean;
    address?: boolean;
    city?: boolean;
    postalCode?: boolean;
    municipality?: boolean;
    phone?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    bankAccounts?: boolean | Prisma.User$bankAccountsArgs<ExtArgs>;
    clients?: boolean | Prisma.User$clientsArgs<ExtArgs>;
    invoices?: boolean | Prisma.User$invoicesArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["user"]>;
export type UserSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    password?: boolean;
    name?: boolean;
    companyName?: boolean;
    pib?: boolean;
    mbr?: boolean;
    activityCode?: boolean;
    address?: boolean;
    city?: boolean;
    postalCode?: boolean;
    municipality?: boolean;
    phone?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["user"]>;
export type UserSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    password?: boolean;
    name?: boolean;
    companyName?: boolean;
    pib?: boolean;
    mbr?: boolean;
    activityCode?: boolean;
    address?: boolean;
    city?: boolean;
    postalCode?: boolean;
    municipality?: boolean;
    phone?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["user"]>;
export type UserSelectScalar = {
    id?: boolean;
    email?: boolean;
    password?: boolean;
    name?: boolean;
    companyName?: boolean;
    pib?: boolean;
    mbr?: boolean;
    activityCode?: boolean;
    address?: boolean;
    city?: boolean;
    postalCode?: boolean;
    municipality?: boolean;
    phone?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type UserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "email" | "password" | "name" | "companyName" | "pib" | "mbr" | "activityCode" | "address" | "city" | "postalCode" | "municipality" | "phone" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>;
export type UserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bankAccounts?: boolean | Prisma.User$bankAccountsArgs<ExtArgs>;
    clients?: boolean | Prisma.User$clientsArgs<ExtArgs>;
    invoices?: boolean | Prisma.User$invoicesArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
};
export type UserIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type UserIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $UserPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "User";
    objects: {
        bankAccounts: Prisma.$BankAccountPayload<ExtArgs>[];
        clients: Prisma.$ClientPayload<ExtArgs>[];
        invoices: Prisma.$InvoicePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        email: string;
        password: string;
        name: string;
        companyName: string | null;
        pib: string | null;
        mbr: string | null;
        activityCode: string | null;
        address: string | null;
        city: string | null;
        postalCode: string | null;
        municipality: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["user"]>;
    composites: {};
};
export type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserPayload, S>;
export type UserCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserCountAggregateInputType | true;
};
export interface UserDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['User'];
        meta: {
            name: 'User';
        };
    };
    findUnique<T extends UserFindUniqueArgs>(args: Prisma.SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UserFindFirstArgs>(args?: Prisma.SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UserFindManyArgs>(args?: Prisma.SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UserCreateArgs>(args: Prisma.SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UserCreateManyArgs>(args?: Prisma.SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UserDeleteArgs>(args: Prisma.SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UserUpdateArgs>(args: Prisma.SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UserDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UserUpdateManyArgs>(args: Prisma.SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UserUpsertArgs>(args: Prisma.SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UserCountArgs>(args?: Prisma.Subset<T, UserCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserCountAggregateOutputType> : number>;
    aggregate<T extends UserAggregateArgs>(args: Prisma.Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>;
    groupBy<T extends UserGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserGroupByArgs['orderBy'];
    } : {
        orderBy?: UserGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UserFieldRefs;
}
export interface Prisma__UserClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    bankAccounts<T extends Prisma.User$bankAccountsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$bankAccountsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    clients<T extends Prisma.User$clientsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$clientsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    invoices<T extends Prisma.User$invoicesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$invoicesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UserFieldRefs {
    readonly id: Prisma.FieldRef<"User", 'String'>;
    readonly email: Prisma.FieldRef<"User", 'String'>;
    readonly password: Prisma.FieldRef<"User", 'String'>;
    readonly name: Prisma.FieldRef<"User", 'String'>;
    readonly companyName: Prisma.FieldRef<"User", 'String'>;
    readonly pib: Prisma.FieldRef<"User", 'String'>;
    readonly mbr: Prisma.FieldRef<"User", 'String'>;
    readonly activityCode: Prisma.FieldRef<"User", 'String'>;
    readonly address: Prisma.FieldRef<"User", 'String'>;
    readonly city: Prisma.FieldRef<"User", 'String'>;
    readonly postalCode: Prisma.FieldRef<"User", 'String'>;
    readonly municipality: Prisma.FieldRef<"User", 'String'>;
    readonly phone: Prisma.FieldRef<"User", 'String'>;
    readonly createdAt: Prisma.FieldRef<"User", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"User", 'DateTime'>;
}
export type UserFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
};
export type UserCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
    where: Prisma.UserWhereUniqueInput;
};
export type UserUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type UserUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type UserUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
};
export type UserDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type User$bankAccountsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelect<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    include?: Prisma.BankAccountInclude<ExtArgs> | null;
    where?: Prisma.BankAccountWhereInput;
    orderBy?: Prisma.BankAccountOrderByWithRelationInput | Prisma.BankAccountOrderByWithRelationInput[];
    cursor?: Prisma.BankAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BankAccountScalarFieldEnum | Prisma.BankAccountScalarFieldEnum[];
};
export type User$clientsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientSelect<ExtArgs> | null;
    omit?: Prisma.ClientOmit<ExtArgs> | null;
    include?: Prisma.ClientInclude<ExtArgs> | null;
    where?: Prisma.ClientWhereInput;
    orderBy?: Prisma.ClientOrderByWithRelationInput | Prisma.ClientOrderByWithRelationInput[];
    cursor?: Prisma.ClientWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientScalarFieldEnum | Prisma.ClientScalarFieldEnum[];
};
export type User$invoicesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    where?: Prisma.InvoiceWhereInput;
    orderBy?: Prisma.InvoiceOrderByWithRelationInput | Prisma.InvoiceOrderByWithRelationInput[];
    cursor?: Prisma.InvoiceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InvoiceScalarFieldEnum | Prisma.InvoiceScalarFieldEnum[];
};
export type UserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
};

import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type BankAccountModel = runtime.Types.Result.DefaultSelection<Prisma.$BankAccountPayload>;
export type AggregateBankAccount = {
    _count: BankAccountCountAggregateOutputType | null;
    _min: BankAccountMinAggregateOutputType | null;
    _max: BankAccountMaxAggregateOutputType | null;
};
export type BankAccountMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    bankName: string | null;
    accountNumber: string | null;
    currency: $Enums.Currency | null;
    isDefault: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type BankAccountMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    bankName: string | null;
    accountNumber: string | null;
    currency: $Enums.Currency | null;
    isDefault: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type BankAccountCountAggregateOutputType = {
    id: number;
    userId: number;
    bankName: number;
    accountNumber: number;
    currency: number;
    isDefault: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type BankAccountMinAggregateInputType = {
    id?: true;
    userId?: true;
    bankName?: true;
    accountNumber?: true;
    currency?: true;
    isDefault?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type BankAccountMaxAggregateInputType = {
    id?: true;
    userId?: true;
    bankName?: true;
    accountNumber?: true;
    currency?: true;
    isDefault?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type BankAccountCountAggregateInputType = {
    id?: true;
    userId?: true;
    bankName?: true;
    accountNumber?: true;
    currency?: true;
    isDefault?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type BankAccountAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BankAccountWhereInput;
    orderBy?: Prisma.BankAccountOrderByWithRelationInput | Prisma.BankAccountOrderByWithRelationInput[];
    cursor?: Prisma.BankAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | BankAccountCountAggregateInputType;
    _min?: BankAccountMinAggregateInputType;
    _max?: BankAccountMaxAggregateInputType;
};
export type GetBankAccountAggregateType<T extends BankAccountAggregateArgs> = {
    [P in keyof T & keyof AggregateBankAccount]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateBankAccount[P]> : Prisma.GetScalarType<T[P], AggregateBankAccount[P]>;
};
export type BankAccountGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BankAccountWhereInput;
    orderBy?: Prisma.BankAccountOrderByWithAggregationInput | Prisma.BankAccountOrderByWithAggregationInput[];
    by: Prisma.BankAccountScalarFieldEnum[] | Prisma.BankAccountScalarFieldEnum;
    having?: Prisma.BankAccountScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: BankAccountCountAggregateInputType | true;
    _min?: BankAccountMinAggregateInputType;
    _max?: BankAccountMaxAggregateInputType;
};
export type BankAccountGroupByOutputType = {
    id: string;
    userId: string;
    bankName: string;
    accountNumber: string;
    currency: $Enums.Currency;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: BankAccountCountAggregateOutputType | null;
    _min: BankAccountMinAggregateOutputType | null;
    _max: BankAccountMaxAggregateOutputType | null;
};
export type GetBankAccountGroupByPayload<T extends BankAccountGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<BankAccountGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof BankAccountGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], BankAccountGroupByOutputType[P]> : Prisma.GetScalarType<T[P], BankAccountGroupByOutputType[P]>;
}>>;
export type BankAccountWhereInput = {
    AND?: Prisma.BankAccountWhereInput | Prisma.BankAccountWhereInput[];
    OR?: Prisma.BankAccountWhereInput[];
    NOT?: Prisma.BankAccountWhereInput | Prisma.BankAccountWhereInput[];
    id?: Prisma.StringFilter<"BankAccount"> | string;
    userId?: Prisma.StringFilter<"BankAccount"> | string;
    bankName?: Prisma.StringFilter<"BankAccount"> | string;
    accountNumber?: Prisma.StringFilter<"BankAccount"> | string;
    currency?: Prisma.EnumCurrencyFilter<"BankAccount"> | $Enums.Currency;
    isDefault?: Prisma.BoolFilter<"BankAccount"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"BankAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"BankAccount"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type BankAccountOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    bankName?: Prisma.SortOrder;
    accountNumber?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    isDefault?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type BankAccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.BankAccountWhereInput | Prisma.BankAccountWhereInput[];
    OR?: Prisma.BankAccountWhereInput[];
    NOT?: Prisma.BankAccountWhereInput | Prisma.BankAccountWhereInput[];
    userId?: Prisma.StringFilter<"BankAccount"> | string;
    bankName?: Prisma.StringFilter<"BankAccount"> | string;
    accountNumber?: Prisma.StringFilter<"BankAccount"> | string;
    currency?: Prisma.EnumCurrencyFilter<"BankAccount"> | $Enums.Currency;
    isDefault?: Prisma.BoolFilter<"BankAccount"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"BankAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"BankAccount"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type BankAccountOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    bankName?: Prisma.SortOrder;
    accountNumber?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    isDefault?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.BankAccountCountOrderByAggregateInput;
    _max?: Prisma.BankAccountMaxOrderByAggregateInput;
    _min?: Prisma.BankAccountMinOrderByAggregateInput;
};
export type BankAccountScalarWhereWithAggregatesInput = {
    AND?: Prisma.BankAccountScalarWhereWithAggregatesInput | Prisma.BankAccountScalarWhereWithAggregatesInput[];
    OR?: Prisma.BankAccountScalarWhereWithAggregatesInput[];
    NOT?: Prisma.BankAccountScalarWhereWithAggregatesInput | Prisma.BankAccountScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"BankAccount"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"BankAccount"> | string;
    bankName?: Prisma.StringWithAggregatesFilter<"BankAccount"> | string;
    accountNumber?: Prisma.StringWithAggregatesFilter<"BankAccount"> | string;
    currency?: Prisma.EnumCurrencyWithAggregatesFilter<"BankAccount"> | $Enums.Currency;
    isDefault?: Prisma.BoolWithAggregatesFilter<"BankAccount"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"BankAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"BankAccount"> | Date | string;
};
export type BankAccountCreateInput = {
    id?: string;
    bankName: string;
    accountNumber: string;
    currency?: $Enums.Currency;
    isDefault?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutBankAccountsInput;
};
export type BankAccountUncheckedCreateInput = {
    id?: string;
    userId: string;
    bankName: string;
    accountNumber: string;
    currency?: $Enums.Currency;
    isDefault?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BankAccountUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    bankName?: Prisma.StringFieldUpdateOperationsInput | string;
    accountNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    currency?: Prisma.EnumCurrencyFieldUpdateOperationsInput | $Enums.Currency;
    isDefault?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutBankAccountsNestedInput;
};
export type BankAccountUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    bankName?: Prisma.StringFieldUpdateOperationsInput | string;
    accountNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    currency?: Prisma.EnumCurrencyFieldUpdateOperationsInput | $Enums.Currency;
    isDefault?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BankAccountCreateManyInput = {
    id?: string;
    userId: string;
    bankName: string;
    accountNumber: string;
    currency?: $Enums.Currency;
    isDefault?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BankAccountUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    bankName?: Prisma.StringFieldUpdateOperationsInput | string;
    accountNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    currency?: Prisma.EnumCurrencyFieldUpdateOperationsInput | $Enums.Currency;
    isDefault?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BankAccountUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    bankName?: Prisma.StringFieldUpdateOperationsInput | string;
    accountNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    currency?: Prisma.EnumCurrencyFieldUpdateOperationsInput | $Enums.Currency;
    isDefault?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BankAccountListRelationFilter = {
    every?: Prisma.BankAccountWhereInput;
    some?: Prisma.BankAccountWhereInput;
    none?: Prisma.BankAccountWhereInput;
};
export type BankAccountOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type BankAccountCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    bankName?: Prisma.SortOrder;
    accountNumber?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    isDefault?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BankAccountMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    bankName?: Prisma.SortOrder;
    accountNumber?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    isDefault?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BankAccountMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    bankName?: Prisma.SortOrder;
    accountNumber?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    isDefault?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BankAccountCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.BankAccountCreateWithoutUserInput, Prisma.BankAccountUncheckedCreateWithoutUserInput> | Prisma.BankAccountCreateWithoutUserInput[] | Prisma.BankAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.BankAccountCreateOrConnectWithoutUserInput | Prisma.BankAccountCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.BankAccountCreateManyUserInputEnvelope;
    connect?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
};
export type BankAccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.BankAccountCreateWithoutUserInput, Prisma.BankAccountUncheckedCreateWithoutUserInput> | Prisma.BankAccountCreateWithoutUserInput[] | Prisma.BankAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.BankAccountCreateOrConnectWithoutUserInput | Prisma.BankAccountCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.BankAccountCreateManyUserInputEnvelope;
    connect?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
};
export type BankAccountUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.BankAccountCreateWithoutUserInput, Prisma.BankAccountUncheckedCreateWithoutUserInput> | Prisma.BankAccountCreateWithoutUserInput[] | Prisma.BankAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.BankAccountCreateOrConnectWithoutUserInput | Prisma.BankAccountCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.BankAccountUpsertWithWhereUniqueWithoutUserInput | Prisma.BankAccountUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.BankAccountCreateManyUserInputEnvelope;
    set?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
    disconnect?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
    delete?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
    connect?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
    update?: Prisma.BankAccountUpdateWithWhereUniqueWithoutUserInput | Prisma.BankAccountUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.BankAccountUpdateManyWithWhereWithoutUserInput | Prisma.BankAccountUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.BankAccountScalarWhereInput | Prisma.BankAccountScalarWhereInput[];
};
export type BankAccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.BankAccountCreateWithoutUserInput, Prisma.BankAccountUncheckedCreateWithoutUserInput> | Prisma.BankAccountCreateWithoutUserInput[] | Prisma.BankAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.BankAccountCreateOrConnectWithoutUserInput | Prisma.BankAccountCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.BankAccountUpsertWithWhereUniqueWithoutUserInput | Prisma.BankAccountUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.BankAccountCreateManyUserInputEnvelope;
    set?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
    disconnect?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
    delete?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
    connect?: Prisma.BankAccountWhereUniqueInput | Prisma.BankAccountWhereUniqueInput[];
    update?: Prisma.BankAccountUpdateWithWhereUniqueWithoutUserInput | Prisma.BankAccountUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.BankAccountUpdateManyWithWhereWithoutUserInput | Prisma.BankAccountUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.BankAccountScalarWhereInput | Prisma.BankAccountScalarWhereInput[];
};
export type EnumCurrencyFieldUpdateOperationsInput = {
    set?: $Enums.Currency;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type BankAccountCreateWithoutUserInput = {
    id?: string;
    bankName: string;
    accountNumber: string;
    currency?: $Enums.Currency;
    isDefault?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BankAccountUncheckedCreateWithoutUserInput = {
    id?: string;
    bankName: string;
    accountNumber: string;
    currency?: $Enums.Currency;
    isDefault?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BankAccountCreateOrConnectWithoutUserInput = {
    where: Prisma.BankAccountWhereUniqueInput;
    create: Prisma.XOR<Prisma.BankAccountCreateWithoutUserInput, Prisma.BankAccountUncheckedCreateWithoutUserInput>;
};
export type BankAccountCreateManyUserInputEnvelope = {
    data: Prisma.BankAccountCreateManyUserInput | Prisma.BankAccountCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type BankAccountUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.BankAccountWhereUniqueInput;
    update: Prisma.XOR<Prisma.BankAccountUpdateWithoutUserInput, Prisma.BankAccountUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.BankAccountCreateWithoutUserInput, Prisma.BankAccountUncheckedCreateWithoutUserInput>;
};
export type BankAccountUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.BankAccountWhereUniqueInput;
    data: Prisma.XOR<Prisma.BankAccountUpdateWithoutUserInput, Prisma.BankAccountUncheckedUpdateWithoutUserInput>;
};
export type BankAccountUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.BankAccountScalarWhereInput;
    data: Prisma.XOR<Prisma.BankAccountUpdateManyMutationInput, Prisma.BankAccountUncheckedUpdateManyWithoutUserInput>;
};
export type BankAccountScalarWhereInput = {
    AND?: Prisma.BankAccountScalarWhereInput | Prisma.BankAccountScalarWhereInput[];
    OR?: Prisma.BankAccountScalarWhereInput[];
    NOT?: Prisma.BankAccountScalarWhereInput | Prisma.BankAccountScalarWhereInput[];
    id?: Prisma.StringFilter<"BankAccount"> | string;
    userId?: Prisma.StringFilter<"BankAccount"> | string;
    bankName?: Prisma.StringFilter<"BankAccount"> | string;
    accountNumber?: Prisma.StringFilter<"BankAccount"> | string;
    currency?: Prisma.EnumCurrencyFilter<"BankAccount"> | $Enums.Currency;
    isDefault?: Prisma.BoolFilter<"BankAccount"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"BankAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"BankAccount"> | Date | string;
};
export type BankAccountCreateManyUserInput = {
    id?: string;
    bankName: string;
    accountNumber: string;
    currency?: $Enums.Currency;
    isDefault?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BankAccountUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    bankName?: Prisma.StringFieldUpdateOperationsInput | string;
    accountNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    currency?: Prisma.EnumCurrencyFieldUpdateOperationsInput | $Enums.Currency;
    isDefault?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BankAccountUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    bankName?: Prisma.StringFieldUpdateOperationsInput | string;
    accountNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    currency?: Prisma.EnumCurrencyFieldUpdateOperationsInput | $Enums.Currency;
    isDefault?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BankAccountUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    bankName?: Prisma.StringFieldUpdateOperationsInput | string;
    accountNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    currency?: Prisma.EnumCurrencyFieldUpdateOperationsInput | $Enums.Currency;
    isDefault?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BankAccountSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    bankName?: boolean;
    accountNumber?: boolean;
    currency?: boolean;
    isDefault?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["bankAccount"]>;
export type BankAccountSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    bankName?: boolean;
    accountNumber?: boolean;
    currency?: boolean;
    isDefault?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["bankAccount"]>;
export type BankAccountSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    bankName?: boolean;
    accountNumber?: boolean;
    currency?: boolean;
    isDefault?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["bankAccount"]>;
export type BankAccountSelectScalar = {
    id?: boolean;
    userId?: boolean;
    bankName?: boolean;
    accountNumber?: boolean;
    currency?: boolean;
    isDefault?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type BankAccountOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "bankName" | "accountNumber" | "currency" | "isDefault" | "createdAt" | "updatedAt", ExtArgs["result"]["bankAccount"]>;
export type BankAccountInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type BankAccountIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type BankAccountIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $BankAccountPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "BankAccount";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        bankName: string;
        accountNumber: string;
        currency: $Enums.Currency;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["bankAccount"]>;
    composites: {};
};
export type BankAccountGetPayload<S extends boolean | null | undefined | BankAccountDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$BankAccountPayload, S>;
export type BankAccountCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<BankAccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: BankAccountCountAggregateInputType | true;
};
export interface BankAccountDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['BankAccount'];
        meta: {
            name: 'BankAccount';
        };
    };
    findUnique<T extends BankAccountFindUniqueArgs>(args: Prisma.SelectSubset<T, BankAccountFindUniqueArgs<ExtArgs>>): Prisma.Prisma__BankAccountClient<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends BankAccountFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, BankAccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__BankAccountClient<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends BankAccountFindFirstArgs>(args?: Prisma.SelectSubset<T, BankAccountFindFirstArgs<ExtArgs>>): Prisma.Prisma__BankAccountClient<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends BankAccountFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, BankAccountFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__BankAccountClient<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends BankAccountFindManyArgs>(args?: Prisma.SelectSubset<T, BankAccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends BankAccountCreateArgs>(args: Prisma.SelectSubset<T, BankAccountCreateArgs<ExtArgs>>): Prisma.Prisma__BankAccountClient<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends BankAccountCreateManyArgs>(args?: Prisma.SelectSubset<T, BankAccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends BankAccountCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, BankAccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends BankAccountDeleteArgs>(args: Prisma.SelectSubset<T, BankAccountDeleteArgs<ExtArgs>>): Prisma.Prisma__BankAccountClient<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends BankAccountUpdateArgs>(args: Prisma.SelectSubset<T, BankAccountUpdateArgs<ExtArgs>>): Prisma.Prisma__BankAccountClient<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends BankAccountDeleteManyArgs>(args?: Prisma.SelectSubset<T, BankAccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends BankAccountUpdateManyArgs>(args: Prisma.SelectSubset<T, BankAccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends BankAccountUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, BankAccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends BankAccountUpsertArgs>(args: Prisma.SelectSubset<T, BankAccountUpsertArgs<ExtArgs>>): Prisma.Prisma__BankAccountClient<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends BankAccountCountArgs>(args?: Prisma.Subset<T, BankAccountCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], BankAccountCountAggregateOutputType> : number>;
    aggregate<T extends BankAccountAggregateArgs>(args: Prisma.Subset<T, BankAccountAggregateArgs>): Prisma.PrismaPromise<GetBankAccountAggregateType<T>>;
    groupBy<T extends BankAccountGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: BankAccountGroupByArgs['orderBy'];
    } : {
        orderBy?: BankAccountGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, BankAccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBankAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: BankAccountFieldRefs;
}
export interface Prisma__BankAccountClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface BankAccountFieldRefs {
    readonly id: Prisma.FieldRef<"BankAccount", 'String'>;
    readonly userId: Prisma.FieldRef<"BankAccount", 'String'>;
    readonly bankName: Prisma.FieldRef<"BankAccount", 'String'>;
    readonly accountNumber: Prisma.FieldRef<"BankAccount", 'String'>;
    readonly currency: Prisma.FieldRef<"BankAccount", 'Currency'>;
    readonly isDefault: Prisma.FieldRef<"BankAccount", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"BankAccount", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"BankAccount", 'DateTime'>;
}
export type BankAccountFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelect<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    include?: Prisma.BankAccountInclude<ExtArgs> | null;
    where: Prisma.BankAccountWhereUniqueInput;
};
export type BankAccountFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelect<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    include?: Prisma.BankAccountInclude<ExtArgs> | null;
    where: Prisma.BankAccountWhereUniqueInput;
};
export type BankAccountFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type BankAccountFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type BankAccountFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type BankAccountCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelect<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    include?: Prisma.BankAccountInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.BankAccountCreateInput, Prisma.BankAccountUncheckedCreateInput>;
};
export type BankAccountCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.BankAccountCreateManyInput | Prisma.BankAccountCreateManyInput[];
    skipDuplicates?: boolean;
};
export type BankAccountCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    data: Prisma.BankAccountCreateManyInput | Prisma.BankAccountCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.BankAccountIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type BankAccountUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelect<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    include?: Prisma.BankAccountInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.BankAccountUpdateInput, Prisma.BankAccountUncheckedUpdateInput>;
    where: Prisma.BankAccountWhereUniqueInput;
};
export type BankAccountUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.BankAccountUpdateManyMutationInput, Prisma.BankAccountUncheckedUpdateManyInput>;
    where?: Prisma.BankAccountWhereInput;
    limit?: number;
};
export type BankAccountUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.BankAccountUpdateManyMutationInput, Prisma.BankAccountUncheckedUpdateManyInput>;
    where?: Prisma.BankAccountWhereInput;
    limit?: number;
    include?: Prisma.BankAccountIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type BankAccountUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelect<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    include?: Prisma.BankAccountInclude<ExtArgs> | null;
    where: Prisma.BankAccountWhereUniqueInput;
    create: Prisma.XOR<Prisma.BankAccountCreateInput, Prisma.BankAccountUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.BankAccountUpdateInput, Prisma.BankAccountUncheckedUpdateInput>;
};
export type BankAccountDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelect<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    include?: Prisma.BankAccountInclude<ExtArgs> | null;
    where: Prisma.BankAccountWhereUniqueInput;
};
export type BankAccountDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BankAccountWhereInput;
    limit?: number;
};
export type BankAccountDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BankAccountSelect<ExtArgs> | null;
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    include?: Prisma.BankAccountInclude<ExtArgs> | null;
};

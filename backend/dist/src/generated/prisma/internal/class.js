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
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.8.0",
    "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
    "activeProvider": "postgresql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider     = \"prisma-client\"\n  output       = \"../src/generated/prisma\"\n  moduleFormat = \"cjs\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nenum Currency {\n  RSD\n  EUR\n  USD\n}\n\nmodel User {\n  id           String        @id @default(uuid())\n  email        String        @unique\n  password     String\n  name         String\n  // Serbian business details\n  companyName  String?       @map(\"company_name\")\n  pib          String?       @unique // Poreski identifikacioni broj (Tax ID)\n  mbr          String?       @unique // Matični broj registracije\n  activityCode String?       @map(\"activity_code\") // Šifra delatnosti\n  address      String?\n  city         String?\n  municipality String? // Opština — affects tax coefficient\n  phone        String?\n  bankAccounts BankAccount[]\n  createdAt    DateTime      @default(now()) @map(\"created_at\")\n  updatedAt    DateTime      @updatedAt @map(\"updated_at\")\n\n  @@map(\"users\")\n}\n\nmodel BankAccount {\n  id            String   @id @default(uuid())\n  userId        String   @map(\"user_id\")\n  bankName      String   @map(\"bank_name\")\n  accountNumber String   @map(\"account_number\") // Format: XXX-XXXXXXXXXX-XX\n  currency      Currency @default(RSD)\n  isDefault     Boolean  @default(false) @map(\"is_default\")\n  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt     DateTime @default(now()) @map(\"created_at\")\n  updatedAt     DateTime @updatedAt @map(\"updated_at\")\n\n  @@map(\"bank_accounts\")\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"companyName\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"company_name\"},{\"name\":\"pib\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"mbr\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"activityCode\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"activity_code\"},{\"name\":\"address\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"city\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"municipality\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bankAccounts\",\"kind\":\"object\",\"type\":\"BankAccount\",\"relationName\":\"BankAccountToUser\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"}],\"dbName\":\"users\"},\"BankAccount\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"user_id\"},{\"name\":\"bankName\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"bank_name\"},{\"name\":\"accountNumber\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"account_number\"},{\"name\":\"currency\",\"kind\":\"enum\",\"type\":\"Currency\"},{\"name\":\"isDefault\",\"kind\":\"scalar\",\"type\":\"Boolean\",\"dbName\":\"is_default\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"BankAccountToUser\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"}],\"dbName\":\"bank_accounts\"}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"orderBy\",\"cursor\",\"user\",\"bankAccounts\",\"_count\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.createManyAndReturn\",\"User.updateOne\",\"User.updateMany\",\"User.updateManyAndReturn\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"BankAccount.findUnique\",\"BankAccount.findUniqueOrThrow\",\"BankAccount.findFirst\",\"BankAccount.findFirstOrThrow\",\"BankAccount.findMany\",\"BankAccount.createOne\",\"BankAccount.createMany\",\"BankAccount.createManyAndReturn\",\"BankAccount.updateOne\",\"BankAccount.updateMany\",\"BankAccount.updateManyAndReturn\",\"BankAccount.upsertOne\",\"BankAccount.deleteOne\",\"BankAccount.deleteMany\",\"BankAccount.groupBy\",\"BankAccount.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"userId\",\"bankName\",\"accountNumber\",\"Currency\",\"currency\",\"isDefault\",\"createdAt\",\"updatedAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"email\",\"password\",\"name\",\"companyName\",\"pib\",\"mbr\",\"activityCode\",\"address\",\"city\",\"municipality\",\"phone\",\"every\",\"some\",\"none\",\"is\",\"isNot\",\"connectOrCreate\",\"upsert\",\"createMany\",\"set\",\"disconnect\",\"delete\",\"connect\",\"updateMany\",\"deleteMany\"]"),
    graph: "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-ACAZAAA-ACA4IAAAAAE_IAA9ACELBQAAOwAgGAAAPAAgGQAAPAAgOEAAAAABOUAAAAAEOkAAAAAEO0AAAAABPEAAAAABPUAAAAABPkAAAAABP0AAOgAhCwUAADsAIBgAADwAIBkAADwAIDhAAAAAATlAAAAABDpAAAAABDtAAAAAATxAAAAAAT1AAAAAAT5AAAAAAT9AADoAIQg4AgAAAAE5AgAAAAQ6AgAAAAQ7AgAAAAE8AgAAAAE9AgAAAAE-AgAAAAE_AgA7ACEIOEAAAAABOUAAAAAEOkAAAAAEO0AAAAABPEAAAAABPUAAAAABPkAAAAABP0AAPAAhBQUAADsAIBgAAD4AIBkAAD4AIDggAAAAAT8gAD0AIQI4IAAAAAE_IAA-ACEHBQAAOwAgGAAAQAAgGQAAQAAgOAAAADQCOQAAADQIOgAAADQIPwAAPzQiBDgAAAA0AjkAAAA0CDoAAAA0CD8AAEA0Ig4FAAA7ACAYAABCACAZAABCACA4AQAAAAE5AQAAAAQ6AQAAAAQ7AQAAAAE8AQAAAAE9AQAAAAE-AQAAAAE_AQBBACFAAQAAAAFBAQAAAAFCAQAAAAELOAEAAAABOQEAAAAEOgEAAAAEOwEAAAABPAEAAAABPQEAAAABPgEAAAABPwEAQgAhQAEAAAABQQEAAAABQgEAAAABESwAAEMAMC0AABwAEC4AAEMAMC8BADYAITZAADkAITdAADkAIUMBADYAIUQBADYAIUUBADYAIUYBAEQAIUcBAEQAIUgBAEQAIUkBAEQAIUoBAEQAIUsBAEQAIUwBAEQAIU0BAEQAIQ4FAABGACAYAABHACAZAABHACA4AQAAAAE5AQAAAAU6AQAAAAU7AQAAAAE8AQAAAAE9AQAAAAE-AQAAAAE_AQBFACFAAQAAAAFBAQAAAAFCAQAAAAEOBQAARgAgGAAARwAgGQAARwAgOAEAAAABOQEAAAAFOgEAAAAFOwEAAAABPAEAAAABPQEAAAABPgEAAAABPwEARQAhQAEAAAABQQEAAAABQgEAAAABCDgCAAAAATkCAAAABToCAAAABTsCAAAAATwCAAAAAT0CAAAAAT4CAAAAAT8CAEYAIQs4AQAAAAE5AQAAAAU6AQAAAAU7AQAAAAE8AQAAAAE9AQAAAAE-AQAAAAE_AQBHACFAAQAAAAFBAQAAAAFCAQAAAAESBAAATAAgLAAASAAwLQAACQAQLgAASAAwLwEASQAhNkAASwAhN0AASwAhQwEASQAhRAEASQAhRQEASQAhRgEASgAhRwEASgAhSAEASgAhSQEASgAhSgEASgAhSwEASgAhTAEASgAhTQEASgAhCzgBAAAAATkBAAAABDoBAAAABDsBAAAAATwBAAAAAT0BAAAAAT4BAAAAAT8BAEIAIUABAAAAAUEBAAAAAUIBAAAAAQs4AQAAAAE5AQAAAAU6AQAAAAU7AQAAAAE8AQAAAAE9AQAAAAE-AQAAAAE_AQBHACFAAQAAAAFBAQAAAAFCAQAAAAEIOEAAAAABOUAAAAAEOkAAAAAEO0AAAAABPEAAAAABPUAAAAABPkAAAAABP0AAPAAhA04AAAMAIE8AAAMAIFAAAAMAIAwDAABQACAsAABNADAtAAADABAuAABNADAvAQBJACEwAQBJACExAQBJACEyAQBJACE0AABONCI1IABPACE2QABLACE3QABLACEEOAAAADQCOQAAADQIOgAAADQIPwAAQDQiAjggAAAAAT8gAD4AIRQEAABMACAsAABIADAtAAAJABAuAABIADAvAQBJACE2QABLACE3QABLACFDAQBJACFEAQBJACFFAQBJACFGAQBKACFHAQBKACFIAQBKACFJAQBKACFKAQBKACFLAQBKACFMAQBKACFNAQBKACFRAAAJACBSAAAJACAAAAABVgEAAAABAVYAAAA0AgFWIAAAAAEBVkAAAAABBRIAAHAAIBMAAHMAIFMAAHEAIFQAAHIAIFkAAAEAIAMSAABwACBTAABxACBZAAABACAAAAAAAVYBAAAAAQsSAABgADATAABlADBTAABhADBUAABiADBVAABjACBWAABkADBXAABkADBYAABkADBZAABkADBaAABmADBbAABnADAHLwEAAAABMQEAAAABMgEAAAABNAAAADQCNSAAAAABNkAAAAABN0AAAAABAgAAAAUAIBIAAGsAIAMAAAAFACASAABrACATAABqACABCwAAbwAwDAMAAFAAICwAAE0AMC0AAAMAEC4AAE0AMC8BAAAAATABAEkAITEBAEkAITIBAEkAITQAAE40IjUgAE8AITZAAEsAITdAAEsAIQIAAAAFACALAABqACACAAAAaAAgCwAAaQAgCywAAGcAMC0AAGgAEC4AAGcAMC8BAEkAITABAEkAITEBAEkAITIBAEkAITQAAE40IjUgAE8AITZAAEsAITdAAEsAIQssAABnADAtAABoABAuAABnADAvAQBJACEwAQBJACExAQBJACEyAQBJACE0AABONCI1IABPACE2QABLACE3QABLACEHLwEAVAAhMQEAVAAhMgEAVAAhNAAAVTQiNSAAVgAhNkAAVwAhN0AAVwAhBy8BAFQAITEBAFQAITIBAFQAITQAAFU0IjUgAFYAITZAAFcAITdAAFcAIQcvAQAAAAExAQAAAAEyAQAAAAE0AAAANAI1IAAAAAE2QAAAAAE3QAAAAAEEEgAAYAAwUwAAYQAwVQAAYwAgWQAAZAAwAAkEAABtACBGAABaACBHAABaACBIAABaACBJAABaACBKAABaACBLAABaACBMAABaACBNAABaACAHLwEAAAABMQEAAAABMgEAAAABNAAAADQCNSAAAAABNkAAAAABN0AAAAABDi8BAAAAATZAAAAAATdAAAAAAUMBAAAAAUQBAAAAAUUBAAAAAUYBAAAAAUcBAAAAAUgBAAAAAUkBAAAAAUoBAAAAAUsBAAAAAUwBAAAAAU0BAAAAAQIAAAABACASAABwACADAAAACQAgEgAAcAAgEwAAdAAgEAAAAAkAIAsAAHQAIC8BAFQAITZAAFcAITdAAFcAIUMBAFQAIUQBAFQAIUUBAFQAIUYBAF4AIUcBAF4AIUgBAF4AIUkBAF4AIUoBAF4AIUsBAF4AIUwBAF4AIU0BAF4AIQ4vAQBUACE2QABXACE3QABXACFDAQBUACFEAQBUACFFAQBUACFGAQBeACFHAQBeACFIAQBeACFJAQBeACFKAQBeACFLAQBeACFMAQBeACFNAQBeACECBAYCBQADAQMAAQEEBwAAAAADBQAIGAAJGQAKAAAAAwUACBgACRkACgEDAAEBAwABAwUADxgAEBkAEQAAAAMFAA8YABAZABEGAgEHCAEICwEJDAEKDQEMDwENEQQOEgUPFAEQFgQRFwYUGAEVGQEWGgQaHQcbHgscHwIdIAIeIQIfIgIgIwIhJQIiJwQjKAwkKgIlLAQmLQ0nLgIoLwIpMAQqMw4rNBI"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.js"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map
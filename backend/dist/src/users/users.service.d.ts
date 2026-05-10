import { User, Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    user(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null>;
    users(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]>;
    createUser(data: Prisma.UserCreateInput): Promise<User>;
    updateUser(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<UserResponseDto>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User>;
}

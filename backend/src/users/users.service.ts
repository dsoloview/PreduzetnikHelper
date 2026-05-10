import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {User, Prisma} from "../generated/prisma/client";
import {PrismaService} from "../prisma/prisma.service";
import {UpdateUserDto} from "./dto/update-user.dto";
import {UserResponseDto} from "./dto/user-response.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async user(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    ): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: userWhereUniqueInput,
        });
    }

    async users(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const { where, data } = params;
        return this.prisma.user.update({
            data,
            where,
        });
    }

    async updateProfile(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
        const updated = await this.prisma.user.update({ where: { id: userId }, data: dto });
        const { password, ...profile } = updated;
        return profile;
    }

    async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        const valid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!valid) throw new UnprocessableEntityException('Current password is incorrect');
        const hashed = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    }

    async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({
            where,
        });
    }
}

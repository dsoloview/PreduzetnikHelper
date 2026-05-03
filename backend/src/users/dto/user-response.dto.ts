import {ApiProperty} from "@nestjs/swagger";
import { IUserResponse } from "@preduzetnik/shared";

export class UserResponseDto implements IUserResponse {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    id: string;
    @ApiProperty({ example: 'user@example.com' })
    email: string;
    @ApiProperty({ example: 'User' })
    name: string;
    @ApiProperty({ example: 'My Company', required: false })
    companyName: string | null;
    @ApiProperty({ example: '123456789', required: false })
    pib: string | null;
    @ApiProperty()
    createdAt: Date;
}
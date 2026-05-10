import {ApiProperty} from "@nestjs/swagger";
import { IUserResponse } from "@preduzetnik/shared";

export class UserResponseDto implements IUserResponse {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    id: string;
    @ApiProperty({ example: 'user@example.com' })
    email: string;
    @ApiProperty({ example: 'User' })
    name: string;
    @ApiProperty({ example: 'My Company', nullable: true })
    companyName: string | null;
    @ApiProperty({ example: '123456789', nullable: true })
    pib: string | null;
    @ApiProperty({ example: '123456789', nullable: true })
    mbr: string | null;
    @ApiProperty({ example: '6201', nullable: true })
    activityCode: string | null;
    @ApiProperty({ example: '123 Main St', nullable: true })
    address: string | null;
    @ApiProperty({ example: 'Beograd', nullable: true })
    city: string | null;
    @ApiProperty({ example: '11000', nullable: true })
    postalCode: string | null;
    @ApiProperty({ example: 'Serbia', nullable: true })
    municipality: string | null;
    @ApiProperty({ example: '+381612345678', nullable: true })
    phone: string | null;
    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    createdAt: Date;
}
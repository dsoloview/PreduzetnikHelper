import type {ClientType, IClient} from "@preduzetnik/shared";
import {CLIENT_TYPES} from "@preduzetnik/shared";
import {ApiProperty} from "@nestjs/swagger";

export class ClientResponseDto implements IClient {
    @ApiProperty({example: '550e8400-e29b-41d4-a716-446655440000'})
    id: string;
    @ApiProperty({enum: CLIENT_TYPES})
    type: ClientType;
    @ApiProperty({example: 'name'})
    name: string;
    @ApiProperty({example: 'test@test.com', nullable: true})
    email: string | null;
    @ApiProperty({example: '123456789', nullable: true})
    phone: string | null;
    @ApiProperty({example: 'address'})
    address: string;
    @ApiProperty({example: 'city'})
    city: string;
    @ApiProperty({example: 'country'})
    country: string;
    @ApiProperty({example: '123456789'})
    taxId: string;
    @ApiProperty({example: '123456789'})
    registrationNumber: string;
    @ApiProperty({example: '2023-01-01T00:00:00.000Z'})
    createdAt: Date;
}
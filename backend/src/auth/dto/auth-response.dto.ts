import { ApiProperty } from '@nestjs/swagger';
import { IAuthResponse } from "@preduzetnik/shared";

export class AuthResponseDto implements IAuthResponse {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
    accessToken: string;
}

import {Controller, Get, Request} from '@nestjs/common';
import {UsersService} from "./users.service";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Get()
    async profile(@Request() req) {
        return this.usersService.user({ id: req.user.userId });
    }
}

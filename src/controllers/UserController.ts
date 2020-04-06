import { CurrentUser, Get, JsonController } from 'routing-controllers';
import { UserService } from 'src/services/UserService';
import { AppUser } from 'src/types/common';

@JsonController('/user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('/')
    async getUser(@CurrentUser() user: AppUser) {
        return await this.userService.findUserById(user.id);
    }
}

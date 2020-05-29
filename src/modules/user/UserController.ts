import { CurrentUser, Get, JsonController } from 'routing-controllers';
import { UserService } from 'src/modules/user/UserService';
import { BaseUser } from 'src/types/common';

@JsonController('/user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('/')
    async getUser(@CurrentUser() user: BaseUser) {
        return await this.userService.findUserById(user.id);
    }
}

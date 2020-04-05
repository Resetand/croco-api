import { Body, JsonController, Post } from 'routing-controllers';
import { AuthService, RegisterPayload } from 'src/services/AuthService';

@JsonController('/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/login')
    async login(@Body() body: { username: string; password: string }) {
        return await this.authService.loginByPassword(body.username, body.password);
    }

    @Post('/register')
    async register(@Body() body: RegisterPayload) {
        return await this.authService.registerUser({ ...body });
    }
}

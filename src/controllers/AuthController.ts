import { Body, JsonController, Post, Get } from 'routing-controllers';
import { AuthService, RegisterPayload } from 'src/services/AuthService';

@JsonController('/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('/')
    test = () => 'asdd';

    @Post('/login')
    async login(@Body() body: { login: string; password: string }) {
        return await this.authService.loginByPassword(body.login, body.password);
    }

    @Post('/register')
    async register(@Body() body: RegisterPayload) {
        return await this.authService.registerUser({ ...body });
    }
}

import { JsonController, Body, Post, Get } from 'routing-controllers';
import { AuthService, RegisterPayload } from 'src/services/AuthService';
import { Inject } from 'typedi';

@JsonController('/auth')
export class AuthController {
    @Inject() private authService: AuthService;

    @Get('/test')
    test() {
        console.log({ 'this.authService': this.authService });

        return this.authService.test();
    }

    @Post('/login')
    async login(@Body() body: { login: string; password: string }) {
        return await this.authService.loginByPassword(body.login, body.password);
    }

    @Post('/register')
    async register(@Body() body: RegisterPayload) {
        return await this.authService.registerUser({ ...body });
    }
}

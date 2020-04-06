import { Body, JsonController, Post } from 'routing-controllers';
import { AuthService, RegisterPayload } from 'src/services/AuthService';

@JsonController('/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/login')
    async login(@Body() body: { username: string; password: string }) {
        return this.authService.loginByPassword(body.username, body.password);
    }

    @Post('/register')
    async register(@Body() body: RegisterPayload) {
        return this.authService.registerUser({ ...body });
    }

    @Post('/forgot_password')
    async forgotPassword(@Body() body: { usernameOrEmail: string }) {
        return this.authService.sendResetPasswordEmail(body.usernameOrEmail);
    }

    @Post('/forgot_password/confirm')
    async forgotPasswordConfirm(@Body() body: { token: string; password: string }) {
        return this.authService.confirmPassportRecovery(body.token, body.password);
    }
}

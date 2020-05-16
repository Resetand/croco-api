import { IsDefined, IsEmail } from 'class-validator';
import { Body, JsonController, Post } from 'routing-controllers';
import { AuthService } from 'src/services/AuthService';

class RegisterSchema {
    @IsEmail()
    @IsDefined()
    email!: string;

    @IsDefined()
    username!: string;

    @IsDefined()
    password!: string;
}

class LoginSchema {
    @IsDefined()
    username!: string;

    @IsDefined()
    password!: string;
}

@JsonController('/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/login')
    async login(@Body() body: LoginSchema) {
        return this.authService.loginByPassword(body.username, body.password);
    }

    @Post('/register')
    async register(@Body() body: RegisterSchema) {
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

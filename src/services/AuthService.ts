import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { validate as isEmail } from 'isemail';
import jwt from 'jsonwebtoken';
import { UserEntity } from 'src/entities/UserEntity';
import { EmailService } from 'src/services/EmailService';
import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { v4 } from 'uuid';
import { config } from '../config';
import { JwtPayload } from '../types/common';
import { badRequest, internalError, invalidOperation, notFound } from '../utils/result';

export type RegisterPayload = {
    username: string;
    password: string;
    email: string;
};

const DAY = 1000 * 60 * 60 * 12;

@Service()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepo: Repository<UserEntity>,
        @Inject(() => EmailService) private emailService: EmailService,
    ) {}

    async loginByPassword(username: string, password: string) {
        const user = await this.userRepo.findOne({ username });

        if (!user) {
            return invalidOperation(`Cannot find user with such username: ${username}`);
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return badRequest(`Invalid password`);
        }

        return { accessToken: this.creteAccessToken(user.id) };
    }

    async registerUser(args: RegisterPayload) {
        const hashedPassword = await bcrypt.hash(args.password, 10);
        const id = v4();
        const accessToken = this.creteAccessToken(id);
        const user = this.userRepo.create({ id, email: args.email, username: args.username, password: hashedPassword });
        try {
            await this.userRepo.save(user);
        } catch (e) {
            return internalError(e.message, { error: e });
        }
        return { accessToken };
    }

    async confirmPassportRecovery(resetToken: string, password: string) {
        const user = await this.userRepo.findOne({ resetPasswordToken: resetToken });

        if (!user || !user?.resetPasswordExpires) {
            return notFound('Reset token is invalid');
        }

        if (new Date().getTime() > user.resetPasswordExpires.getTime()) {
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await this.userRepo.save(user);
            return badRequest('reset token is expired');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.userRepo.save(user);
        return { status: 'ok' };
    }

    async sendResetPasswordEmail(usernameOrEmail: string) {
        let user: UserEntity | undefined;

        if (isEmail(usernameOrEmail)) {
            user = await this.userRepo.findOne({ email: usernameOrEmail });
            await this.userRepo.findOne({ email: usernameOrEmail });
        } else {
            user = await this.userRepo.findOne({ username: usernameOrEmail });
        }
        if (!user) {
            return notFound('User with such email or username not found');
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordExpires = new Date(Date.now() + DAY);
        user.resetPasswordToken = resetToken;
        try {
            await this.userRepo.save(user);
        } catch (e) {
            return internalError(e.message, { error: e });
        }
        const url = `${config.webApp.url}/auth/forgot/${resetToken}`;

        return this.emailService.sendResetPasswordMail({
            userEmail: user.email,
            username: user.username,
            redirectUrl: url,
        });
    }

    private creteAccessToken(userId: string) {
        const jwtPayload = { sub: userId, iss: 'habits' } as JwtPayload;
        return jwt.sign(jwtPayload, config.auth.jwtSecret, { expiresIn: '30 days' });
    }
}

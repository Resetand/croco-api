import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { validate as isEmail } from 'isemail';
import jwt from 'jsonwebtoken';
import { DbClient, Transaction } from 'src/db/client';
import { UserEntity } from 'src/entities/UserEntity';
import { EmailService } from 'src/modules/email/EmailService';
import { Inject, Service } from 'typedi';
import { v4 } from 'uuid';
import { config } from '../../config';
import { JwtPayload, BaseUser } from '../../types/common';
import {
    badRequest,
    internalError,
    invalidOperation,
    notFound,
    okResult,
    unauthorized,
    isError,
} from '../../utils/result';
import { tryCatch } from 'src/utils';
import mem from 'mem';
import { logger } from 'src/utils/logger';
import { FindOneOptions } from 'typeorm';

export type RegisterPayload = {
    username: string;
    password: string;
    email: string;
};

type DecodedToken = {
    header: { alg: any; kid: string };
    payload: { sub: string };
};

@Service()
export class AuthService {
    constructor(
        @Inject('dbClient') private dbClient: DbClient,
        @Inject(() => EmailService) private emailService: EmailService,
    ) {}

    async loginByPassword(username: string, password: string) {
        return this.dbClient.transaction(async ({ manager }) => {
            const userRepo = manager.getRepository(UserEntity);
            const user = await userRepo.findOne({
                where: [{ username }, { email: username }],
                select: ['id', 'password'],
            });

            if (!user) {
                return invalidOperation(`Cannot find user with such username: ${username}`);
            }
            if (!(await bcrypt.compare(password, user.password))) {
                return badRequest(`Invalid password`);
            }

            return { accessToken: this.creteAccessToken(user.id) };
        });
    }

    async registerUser(args: RegisterPayload) {
        return this.dbClient.transaction(async ({ manager }) => {
            const userRepo = manager.getRepository(UserEntity);

            const hashedPassword = await bcrypt.hash(args.password, 10);
            const id = v4();
            const accessToken = this.creteAccessToken(id);

            try {
                await userRepo.save({
                    id,
                    email: args.email,
                    username: args.username,
                    password: hashedPassword,
                });
            } catch (e) {
                return internalError(e.message, { error: e });
            }
            return { accessToken };
        });
    }

    async confirmPassportRecovery(resetToken: string, password: string) {
        return this.dbClient.transaction(async ({ manager }) => {
            const userRepo = manager.getRepository(UserEntity);

            const user = await userRepo.findOne({ resetPasswordToken: resetToken });

            if (!user || !user?.resetPasswordExpires) {
                return notFound('Reset token is invalid');
            }

            if (new Date().getTime() > user.resetPasswordExpires.getTime()) {
                user.resetPasswordToken = null;
                user.resetPasswordExpires = null;
                await userRepo.save(user);
                return badRequest('reset token is expired');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await userRepo.save(user);

            return okResult;
        });
    }

    async sendResetPasswordEmail(usernameOrEmail: string) {
        return this.dbClient.transaction(async ({ manager }) => {
            const userRepo = manager.getRepository(UserEntity);

            let user: UserEntity | undefined;
            const DAY = 1000 * 60 * 60 * 12;

            if (isEmail(usernameOrEmail)) {
                user = await userRepo.findOne({ email: usernameOrEmail });
                await userRepo.findOne({ email: usernameOrEmail });
            } else {
                user = await userRepo.findOne({ username: usernameOrEmail });
            }
            if (!user) {
                return notFound('User with such email or username not found');
            }
            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetPasswordExpires = new Date(Date.now() + DAY);
            user.resetPasswordToken = resetToken;
            try {
                await userRepo.save(user);
            } catch (e) {
                return internalError(e.message, { error: e });
            }
            const url = `${config.webApp.url}/auth/forgot/${resetToken}`;

            return this.emailService.sendResetPasswordMail({
                userEmail: user.email,
                username: user.username,
                redirectUrl: url,
            });
        });
    }

    private creteAccessToken(userId: string) {
        const jwtPayload = { sub: userId, iss: 'habits' } as JwtPayload;
        return jwt.sign(jwtPayload, config.auth.jwtSecret, { expiresIn: '30 days' });
    }

    public async authenticate(token: string) {
        const decoded = tryCatch(
            () => (jwt.verify(token, config.auth.jwtSecret), jwt.decode(token, { complete: true }) as DecodedToken),
            (e) => unauthorized(e.message),
        );

        if (isError(decoded)) {
            return decoded;
        }

        const { payload } = decoded;

        if (!payload || !payload.sub || typeof payload.sub !== 'string') {
            return unauthorized('Invalid access token payload');
        }

        return this.dbClient.transaction(async (t) => {
            const user: BaseUser | undefined = await getUserCached(payload.sub, t, {
                select: ['id', 'username', 'email'],
            });

            if (!user) {
                return notFound('user not found');
            }

            return user;
        });
    }
}

const getUserCached = mem(
    async (id: string, t: Transaction, opt: FindOneOptions<UserEntity>) => {
        logger.warn('fetch user for intercept ' + id);
        return t.manager.getRepository(UserEntity).findOne(id, opt);
    },
    { maxAge: 1000 * 60 * 5, cacheKey: ([key]) => key },
);

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserEntity } from 'src/entities/UserEntity';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { v4 } from 'uuid';
import { config } from '../config';
import { JwtPayload } from '../types';
import { badRequest, error, invalidOperation } from '../utils/result';

export type RegisterPayload = {
    username: string;
    password: string;
    email: string;
};

@Service()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepo: Repository<UserEntity>,
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
            return error('INTERNAL_ERROR', e.message, 500);
        }
        return { accessToken };
    }

    private creteAccessToken(userId: string) {
        const jwtPayload = { sub: userId, iss: 'habits' } as JwtPayload;
        return jwt.sign(jwtPayload, config.auth.jwtSecret, { expiresIn: '30 days' });
    }
}

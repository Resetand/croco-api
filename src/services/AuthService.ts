import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserEntity } from 'src/entities/UserEntity';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { v4 } from 'uuid';
import { config } from '../config';
import { JwtPayload } from '../types';
import { badRequest, invalidOperation } from '../utils/result';

export type RegisterPayload = {
    login: string;
    password: string;
    email: string;
};

@Service()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepo: Repository<UserEntity>,
    ) {}

    async loginByPassword(login: string, password: string) {
        const user = await this.userRepo.findOne({ login });
        if (!user) {
            return invalidOperation('Не найден пользователь с таким логином');
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return badRequest(`Некорректный пароль`);
        }

        return { state: 'SUCCESS', accessToken: this.creteAccessToken(user.id) };
    }

    async registerUser(args: RegisterPayload) {
        const { email, login } = args;
        console.log(args);
        const hashedPassword = await bcrypt.hash(args.password, 10);
        const id = v4();
        const accessToken = this.creteAccessToken(id);
        await this.userRepo.create({ id, email, login, password: hashedPassword });
        return { accessToken };
    }

    private creteAccessToken(userId: string) {
        const jwtPayload = { sub: userId, iss: 'habits' } as JwtPayload;
        return jwt.sign(jwtPayload, config.auth.jwtSecret, { expiresIn: '30 days' });
    }
}

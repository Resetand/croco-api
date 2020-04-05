import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { UserEntity } from 'src/entities/UserEntity';
import { Repository } from 'typeorm';
import { notFound } from 'src/utils/result';

@Service()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepo: Repository<UserEntity>,
    ) {}

    async findUserById(id: string) {
        const user = await this.userRepo.findOne(id);
        if (!user) {
            return notFound('user not found');
        }
        return user;
    }
}

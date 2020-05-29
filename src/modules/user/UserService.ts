import { DbClient } from 'src/db/client';
import { UserEntity } from 'src/entities/UserEntity';
import { notFound } from 'src/utils/result';
import { Inject, Service } from 'typedi';

@Service()
export class UserService {
    constructor(@Inject('dbClient') private dbClient: DbClient) {}

    async findUserById(id: string) {
        return this.dbClient.transaction(async ({ manager }) => {
            const user = await manager
                .getRepository(UserEntity)
                .findOne(id, { select: ['id', 'email', 'username', 'updatedAt', 'createdAt'] });

            if (!user) {
                return notFound('user not found');
            }

            return user;
        });
    }
}

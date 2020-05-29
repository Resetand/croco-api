import shortId from 'shortid';
import { DbClient } from 'src/db/client';
import { LobbyEntity } from 'src/entities/LobbyEntity';
import { LobbyUserEntity } from 'src/entities/LobbyUserEntity';
import { UserEntity } from 'src/entities/UserEntity';
import { MediaServerService } from 'src/modules/media-server/MediaServerService';
import { internalError, isError, notFound, resultAll } from 'src/utils/result';
import { Inject, Service } from 'typedi';

@Service()
export class LobbyService {
    constructor(
        @Inject('dbClient') private dbClient: DbClient,
        @Inject(() => MediaServerService) private mediaServerService: MediaServerService,
    ) {}

    public async getLobbies() {
        return this.dbClient.transaction(async ({ manager }) => {
            const lobbyRepo = manager.getRepository(LobbyEntity);
            return await lobbyRepo.find({ select: ['id', 'name', 'createdAt', 'updatedAt'] });
        });
    }

    public async createLobby(args: { name?: string }) {
        return this.dbClient.transaction(async ({ manager }) => {
            const lobbyRepo = manager.getRepository(LobbyEntity);

            const id = shortId();
            const res = await resultAll(
                lobbyRepo.save({ id, name: args.name }).catch((e) => internalError('Problems with db', e)),
                this.mediaServerService.createSession(id),
            );

            if (isError(res)) {
                return res;
            }
            const [lobby] = res;
            return lobby;
        });
    }

    public async connectToLobby(args: { lobbyId: string; userId: string }) {
        return this.dbClient.transaction(async (t) => {
            const userRepo = t.manager.getRepository(UserEntity);
            const lobbyUserRepo = t.manager.getRepository(LobbyUserEntity);

            const { lobbyId, userId } = args;

            const user = await userRepo.findOne(userId, { select: ['id', 'username'] });

            if (!user) {
                return notFound('user not found');
            }

            if (!(await t.manager.getRepository(LobbyEntity).findOne(lobbyId))) {
                return notFound('lobby not found');
            }

            if (!(await lobbyUserRepo.findOne({ where: { userId, lobbyId }, select: ['createdAt'] }))) {
                await lobbyUserRepo.save({ userId, lobbyId });
            }

            const token = await this.mediaServerService.getToken({ lobbyId, userId, username: user.username });

            if (isError(token)) {
                return token;
            }

            return { token };
        });
    }
}

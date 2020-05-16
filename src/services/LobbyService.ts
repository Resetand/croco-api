import { Service, Inject } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { LobbyEntity } from 'src/entities/LobbyEntity';
import { Repository } from 'typeorm';
import { pick } from 'lodash';
import shortId from 'shortid';
import { v4 } from 'uuid';
import { MediaServerService } from 'src/services/MediaServerService';
import { internalError, isError, resultAll, badRequest, notFound } from 'src/utils/result';
import isUUID from 'is-uuid';
import { UserEntity } from 'src/entities/UserEntity';

@Service()
export class LobbyService {
    constructor(
        @InjectRepository(LobbyEntity) private lobbyRepo: Repository<LobbyEntity>,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @Inject(() => MediaServerService) private mediaServerService: MediaServerService,
    ) {}

    public async getLobbies() {
        return (await this.lobbyRepo.find()).map((item) => ({
            ...pick(item, ['hrId', 'id', 'name', 'createdAt', 'updatedAt']),
        }));
    }

    public async createLobby(args: { name?: string }) {
        const hrId = shortId();
        const id = v4();
        const res = await resultAll(
            this.lobbyRepo.save({ id, hrId, name: args.name }).catch((e) => internalError('Problems with db', e)),
            this.mediaServerService.createSession(id),
        );

        if (isError(res)) {
            return res;
        }
        const [lobby] = res;
        return lobby;
    }

    public async connectToLobby(args: { anyLobbyId: string; userId: string }) {
        const { anyLobbyId, userId } = args;

        const user = await this.userRepo.findOne(userId);

        if (!user) {
            return notFound('user not found');
        }

        const lobbyId = isUUID.v4(anyLobbyId)
            ? anyLobbyId
            : await this.lobbyRepo.findOne({ where: { hrId: anyLobbyId } }).then((x) => x?.id);

        if (!lobbyId) {
            return badRequest('invalid lobby identifier');
        }

        const token = await this.mediaServerService.getToken({ lobbyId, userId, username: user.username });
        if (isError(token)) {
            return token;
        }

        return { token };
    }
}

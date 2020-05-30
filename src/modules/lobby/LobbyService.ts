import shortId from 'shortid';
import { DbClient, Transaction } from 'src/db/client';
import { GameSessionEntity } from 'src/entities/GameSessionEntity';
import { LobbyEntity } from 'src/entities/LobbyEntity';
import { LobbyUserEntity } from 'src/entities/LobbyUserEntity';
import { TermEntity } from 'src/entities/TermEntity';
import { TermsCategoryEntity } from 'src/entities/TermsCategoryEntity';
import { UserEntity } from 'src/entities/UserEntity';
import { MediaServerService } from 'src/modules/media-server/MediaServerService';
import { badRequest, internalError, isError, notFound, resultAll } from 'src/utils/result';
import { Inject, Service } from 'typedi';
import { v4 } from 'uuid';
import { MoreThanOrEqual } from 'typeorm';
import { QueryResult } from 'src/utils/migrations';

type CreateGameSessionArgs = {
    lobbyId: string;
    playerId: string;
    termId?: string;
};

const GAME_DURATION = 1000 * 60 * 5;

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

    public async setCategory(args: { lobbyId: string; termsCategoryId: string }) {
        const { lobbyId, termsCategoryId } = args;
        return this.dbClient.transaction(async (t) => {
            await t.manager.getRepository(LobbyEntity).update({ id: lobbyId }, { termsCategoryId: termsCategoryId });
            return { lobbyId, termsCategoryId };
        });
    }

    private async mapGameSession(t: Transaction, args: { entity: GameSessionEntity }) {
        const { entity } = args;
        const [player, term] = await Promise.all([
            t.manager
                .getRepository(UserEntity)
                .findOne(entity.playerId, { select: ['id', 'email', 'username', 'createdAt', 'updatedAt'] }),
            t.manager
                .getRepository(TermEntity)
                .findOne(entity.termId, { select: ['id', 'content', 'createdAt', 'updatedAt'] }),
        ]);

        if (!player) {
            return badRequest('cannot find player');
        }

        if (!term) {
            return badRequest('cannot find term');
        }

        return {
            id: entity.id,
            deadlineAt: entity.deadlineAt,
            player,
            term,
        };
    }

    private async getActiveSession(t: Transaction, { lobbyId }: { lobbyId: string }) {
        const entity = await t.manager.getRepository(GameSessionEntity).findOne({
            where: { lobbyId, deadlineAt: MoreThanOrEqual(new Date()) },
            select: ['id', 'playerId', 'termId', 'deadlineAt'],
        });

        if (!entity) {
            return undefined;
        }

        return this.mapGameSession(t, { entity });
    }

    public async connectToLobby(args: { lobbyId: string; userId: string }) {
        const { lobbyId, userId } = args;

        return this.dbClient.transaction(async (t) => {
            const userRepo = t.manager.getRepository(UserEntity);
            const lobbyUserRepo = t.manager.getRepository(LobbyUserEntity);

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

            const msToken = await this.mediaServerService.getToken({ lobbyId, userId, username: user.username });

            const lobby = await t.manager
                .getRepository(LobbyEntity)
                .findOne(lobbyId, { select: ['name', 'createdAt', 'termsCategoryId', 'id'] });

            const termsCategory = lobby?.termsCategoryId
                ? await t.manager.getRepository(TermsCategoryEntity).findOne(lobby.termsCategoryId)
                : undefined;

            if (isError(msToken)) {
                return msToken;
            }

            const gameSession = await this.getActiveSession(t, { lobbyId });

            if (isError(gameSession)) {
                return gameSession;
            }

            return {
                msToken,
                lobby,
                termsCategory,
                gameSession,
            };
        });
    }

    private async gatRandomTermForLobby({ sql }: Transaction, args: { lobbyId: string }) {
        const { lobbyId } = args;
        // TODO Сделать 1 запросом
        const q: QueryResult<{ id: string }> = await sql`
            SELECT t.id as id
            FROM terms AS t
            WHERE t.id NOT IN(
                    SELECT gs.term_id FROM game_sessions AS gs
                    WHERE gs.lobby_id = ${lobbyId}
            )
            ORDER BY random() LIMIT 1
        `;
        const getRandom = (): Promise<QueryResult<{ id: string }>> => {
            return sql`
            SELECT t.id as id 
            FROM terms AS t 
            ORDER BY random() LIMIT 1`;
        };
        return q[0]?.id ?? (await getRandom())[0].id;
    }

    public async createGameSession(args: CreateGameSessionArgs) {
        const { lobbyId, playerId } = args;

        return this.dbClient.transaction(async (t) => {
            const termId = args.termId ?? (await this.gatRandomTermForLobby(t, { lobbyId }));
            const gameSession = await this.getActiveSession(t, { lobbyId });

            if (gameSession) {
                return badRequest('has already active game session');
            }
            const entity = await t.manager.getRepository(GameSessionEntity).save({
                id: v4(),
                deadlineAt: new Date(Date.now() + GAME_DURATION),
                playerId,
                termId,
                lobbyId,
            });

            return await this.mapGameSession(t, { entity });
        });
    }

    public handleGuess(args: { userId: string; content: string; lobbyId: string }) {
        const { lobbyId, content } = args;
        return this.dbClient.transaction(async (t) => {
            const gameSession = await this.getActiveSession(t, { lobbyId });

            if (!gameSession) {
                return notFound('active game session not found');
            }
            if (isError(gameSession)) {
                return gameSession;
            }

            const match = String(gameSession.term.content).toLowerCase() === String(content).toLowerCase();

            if (match) {
                await t.manager
                    .getRepository(GameSessionEntity)
                    .update({ id: gameSession.id }, { deadlineAt: new Date() });
            }

            return { match, gameSession };
        });
    }
}

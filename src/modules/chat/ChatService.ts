import { QueryResult } from 'pg';
import { DbClient, Transaction } from 'src/db/client';
import { LobbyMessageEntity } from 'src/entities/LobbyMessageEntity';
import { LobbyUserEntity } from 'src/entities/LobbyUserEntity';
import { UserEntity } from 'src/entities/UserEntity';
import { forbidden, isError, Result } from 'src/utils/result';
import { Inject, Service } from 'typedi';
import { v4 } from 'uuid';
import { pick } from 'lodash';

const PAGE_SIZE = 100;

type SelectArgs = {
    userId: string;
    lobbyId: string;
    page: number;
    pageSize?: number;
};

export type MessageVm = {
    id: string;
    author: { id: string; username: string };
    content: string;
    createdAt: Date | string;
};

type SelectResult = {
    id: string;
    content: string;
    createdAt: string;
    username: string;
    userId: string;
};

@Service()
export class ChatService {
    constructor(@Inject('dbClient') private dbClient: DbClient) {}

    private async selectMessages({ sql }: Transaction, args: SelectArgs) {
        const { lobbyId, userId } = args;

        const result: Result<SelectResult[]> = await sql`
            SELECT 
                lm.id AS id,
                lm.content AS content, 
                lm.created_at AS "createdAt",
                u.username AS username,
                u.id AS "userId"
            FROM
                lobby_messages AS lm
                JOIN lobby_users AS lu ON lu.lobby_id = ${lobbyId} AND lu.user_id = ${userId}
                JOIN users AS u ON u.id=lm.user_id
            WHERE lm.lobby_id=${lobbyId}
            ORDER BY lm.created_at ASC
        `;

        return result;
    }

    public getMessages(args: { userId: string; lobbyId: string; page: number }) {
        return this.dbClient.transaction(async (t) => {
            const result = await this.selectMessages(t, { ...args });

            if (isError(result)) {
                return result;
            }

            const messages = result.map<MessageVm>((x) => ({
                author: { username: x.username, id: x.userId },
                content: x.content,
                id: x.id,
                createdAt: x.createdAt,
            }));

            return messages;
        });
    }

    public sendMessage(args: { userId: string; lobbyId: string; content: string; username?: string }) {
        const { lobbyId, userId, content } = args;

        return this.dbClient.transaction(async (t) => {
            const username =
                args.username! ??
                (await t.manager
                    .getRepository(UserEntity)
                    .findOneOrFail(userId)
                    .then((x) => x.username));

            if (!(await t.manager.getRepository(LobbyUserEntity).findOne({ where: { lobbyId, userId } }))) {
                return forbidden('you cannot send message to this lobby');
            }
            const createdAt = new Date();
            const id = v4();

            const messageEntity = await t.manager
                .getRepository(LobbyMessageEntity)
                .save({ content, lobbyId, userId, id, createdAt });

            const message: MessageVm = {
                ...pick(messageEntity, 'content', 'createdAt', 'id', 'lobbyId'),
                author: { id: userId, username },
            };

            return message;
        });
    }
}

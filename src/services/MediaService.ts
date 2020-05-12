import { OpenVidu } from 'openvidu-node-client';
import { config } from 'src/config';
import { RoomEntity } from 'src/entities/RoomEntity';
import { logger } from 'src/utils/logger';
import { notFound } from 'src/utils/result';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

type ConnectPayload = {
    roomId: string;
    userId: string;
};

@Service()
export class MediaServerService {
    constructor(@InjectRepository(RoomEntity) private roomRepo: Repository<RoomEntity>) {}

    private ov = new OpenVidu(config.mediaServer.url, config.mediaServer.secret);

    private async getActiveSessions() {
        await this.ov.fetch(); // Чо за тупое api ????
        return this.ov.activeSessions;
    }

    private async getSessionByRoomId(roomId: string) {
        const sessions = await this.getActiveSessions();
        return sessions.filter((item) => item.sessionId === roomId)[0];
    }

    public async createRoom({ name }: { name: string }) {
        const room = this.roomRepo.create({ name });
        await this.roomRepo.save(room);
    }

    public connectToRoom = async ({ userId, roomId }: ConnectPayload) => {
        const room = await this.roomRepo.findOne(roomId);
        if (!room) {
            return notFound('Комната не найдена');
        }

        const session =
            (await this.getSessionByRoomId(roomId)) || (await this.ov.createSession({ customSessionId: roomId }));

        if (session.activeConnections.filter((x) => JSON.parse(x.serverData).userId === userId)) {
            logger.info('already connected');
        }

        const token = await session.generateToken({ data: JSON.stringify({ userId }) });
        return { token };
    };

    public async disconnect({ userId, roomId }: ConnectPayload) {
        const room = await this.roomRepo.findOne(roomId);

        if (!room) {
            return notFound('Комната не найдена');
        }

        const session = await this.getSessionByRoomId(roomId);
        console.log(session);

        try {
            await session.forceDisconnect(
                session.activeConnections.filter((el) => JSON.parse(el.serverData).userId === userId)[0],
            );
        } catch (error) {
            logger.error('Cannot disconnect user from session', error);
        }
    }
}

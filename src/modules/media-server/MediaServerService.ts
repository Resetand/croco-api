import { OpenVidu } from 'openvidu-node-client';
import { config } from 'src/config';
import { internalError, isError } from 'src/utils/result';
import { Service } from 'typedi';

type ConnectPayload = {
    lobbyId: string;
    userId: string;
    username: string;
};

@Service()
export class MediaServerService {
    private ov = new OpenVidu(config.mediaServer.url, config.mediaServer.secret);

    public async getActiveSessions() {
        await this.ov.fetch();
        return this.ov.activeSessions;
    }

    public async createSession(lobbyId: string) {
        const session = await this.ov
            .createSession({ customSessionId: lobbyId })
            .catch((e) => internalError('cannot create media-server session', e));
        return session;
    }

    public async getToken({ userId, lobbyId, username }: ConnectPayload) {
        const session =
            (await this.getActiveSessions()).find((s) => s.sessionId === lobbyId) ||
            (await this.createSession(lobbyId));

        if (isError(session)) {
            return session;
        }

        return session
            .generateToken({ data: JSON.stringify({ userId, username }) })
            .catch((origError) => internalError('Error while generate media-server token', { lobbyId, origError }));
    }
}

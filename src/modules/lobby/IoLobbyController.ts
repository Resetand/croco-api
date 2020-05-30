import {
    ConnectedSocket,
    NspParam,
    OnMessage,
    SocketController,
    SocketQueryParam,
    SocketIO,
    MessageBody,
} from 'socket-controllers';
import { Socket, Server } from 'socket.io';
import { ioEvent } from 'src/ioEvents';
import { AuthService } from 'src/modules/auth/AuthService';
import { LobbyService } from 'src/modules/lobby/LobbyService';
import { isError } from 'src/utils/result';
import { Inject } from 'typedi';

class SetCategoryBody {
    termsCategoryId: string;
}

@SocketController('/lobby/:lobbyId')
export class IoLobbyController {
    constructor(
        @Inject(() => AuthService) private authService: AuthService,
        @Inject(() => LobbyService) private lobbyService: LobbyService,
    ) {}

    @OnMessage(ioEvent('lobby.game.set_category'))
    async setTermsCategory(
        @NspParam('lobbyId') lobbyId: string,
        @SocketIO() io: Server,
        @MessageBody() { termsCategoryId }: SetCategoryBody,
        @ConnectedSocket() socket: Socket,
    ) {
        const result = this.lobbyService.setCategory({ lobbyId, termsCategoryId });
        if (isError(result)) {
            return socket.emit(ioEvent('user.error'), result);
        }

        io.of(`/lobby/${lobbyId}`).emit(ioEvent('lobby.game.broadcast.set_category'), result);
    }

    @OnMessage(ioEvent('lobby.connect'))
    async connect(
        @ConnectedSocket() socket: Socket,
        @NspParam('lobbyId') lobbyId: string,
        @SocketQueryParam('accessToken') accessToken: string,
    ) {
        const user = await this.authService.authenticate(accessToken);
        if (isError(user)) return user;

        const result = await this.lobbyService.connectToLobby({ lobbyId, userId: user.id });

        if (isError(result)) {
            return socket.emit(ioEvent('user.error'), result);
        }

        socket.emit(ioEvent('lobby.connected'), { ...result });
    }

    @OnMessage(ioEvent('lobby.game.guess'))
    async handleGuess(
        @NspParam('lobbyId') lobbyId: string,
        @ConnectedSocket() socket: Socket,
        @SocketQueryParam('accessToken') accessToken: string,
        @MessageBody() body: { content: string },
        @SocketIO() io: Server,
    ) {
        const user = await this.authService.authenticate(accessToken);
        if (isError(user)) return user;

        const result = await this.lobbyService.handleGuess({
            content: body.content,
            lobbyId,
            userId: user.id,
        });

        if (isError(result)) {
            return socket.emit(ioEvent('user.error'), result);
        }

        if (result.match) {
            return io.of(`/lobby/${lobbyId}`).emit(ioEvent('lobby.game.broadcast.hit'), {
                winner: user,
                term: result.gameSession.term,
            });
        }
    }

    @OnMessage(ioEvent('lobby.game.session_start'))
    async startGame(
        @NspParam('lobbyId') lobbyId: string,
        @ConnectedSocket() socket: Socket,
        @SocketIO() io: Server,
        @SocketQueryParam('accessToken') accessToken: string,
        @MessageBody() body: { termId: string; playerId: string },
    ) {
        const user = await this.authService.authenticate(accessToken);
        if (isError(user)) return user;

        const result = await this.lobbyService.createGameSession({
            ...body,
            lobbyId,
        });
        if (isError(result)) {
            return socket.emit(ioEvent('user.error'), result);
        }

        return io.of(`/lobby/${lobbyId}`).emit(ioEvent('lobby.game.broadcast.session_start'), { gameSession: result });
    }
}

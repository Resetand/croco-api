import { ConnectedSocket, NspParam, OnMessage, SocketController, SocketQueryParam } from 'socket-controllers';
import { Socket } from 'socket.io';
import { ioEvent } from 'src/ioEvents';
import { AuthService } from 'src/modules/auth/AuthService';
import { LobbyService } from 'src/modules/lobby/LobbyService';
import { isError } from 'src/utils/result';
import { Inject } from 'typedi';

@SocketController('/lobby/:lobbyId')
export class IoLobbyController {
    constructor(
        @Inject(() => AuthService) private authService: AuthService,
        @Inject(() => LobbyService) private lobbyService: LobbyService,
    ) {}

    @OnMessage(ioEvent('lobby.connect'))
    async connect(
        @ConnectedSocket() socket: Socket,
        @NspParam('lobbyId') lobbyId: string,
        @SocketQueryParam('accessToken') accessToken: string,
    ) {
        const user = await this.authService.authenticate(accessToken);
        if (isError(user)) return user;

        const msTokenResult = await this.lobbyService.connectToLobby({ lobbyId, userId: user.id });

        if (isError(msTokenResult)) {
            return socket.emit(ioEvent('user.error'), msTokenResult);
        }

        socket.emit(ioEvent('lobby.connected'), { msToken: msTokenResult.token });
    }

    @OnMessage(ioEvent('lobby.game.guess'))
    async handleGuess(
        @NspParam('lobbyId') lobbyId: string,
        @ConnectedSocket() socket: Socket,
        @SocketQueryParam('accessToken') accessToken: string,
    ) {
        const user = await this.authService.authenticate(accessToken);
        if (isError(user)) return user;
    }

    @OnMessage(ioEvent('lobby.game.sessionStart'))
    async startGame(
        @NspParam('lobbyId') lobbyId: string,
        @ConnectedSocket() socket: Socket,
        @SocketQueryParam('accessToken') accessToken: string,
    ) {
        const user = await this.authService.authenticate(accessToken);
        if (isError(user)) return user;
    }
}

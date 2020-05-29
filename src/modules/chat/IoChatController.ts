import { IsDefined, IsString } from 'class-validator';
import {
    ConnectedSocket,
    MessageBody,
    NspParam,
    OnMessage,
    SocketController,
    SocketIO,
    SocketQueryParam,
} from 'socket-controllers';
import { Server, Socket } from 'socket.io';
import { ioEvent } from 'src/ioEvents';
import { AuthService } from 'src/modules/auth/AuthService';
import { ChatService } from 'src/modules/chat/ChatService';
import { isError } from 'src/utils/result';
import { Inject } from 'typedi';

class MessageSchema {
    @IsDefined()
    @IsString()
    content!: string;
}

@SocketController('/chat/:lobbyId')
export class IoChatController {
    constructor(
        @Inject(() => AuthService) private authService: AuthService,
        @Inject(() => ChatService) private chatService: ChatService,
    ) {}

    @OnMessage(ioEvent('chat.messages.typing'))
    async typing(
        @NspParam('lobbyId') lobbyId: string,
        @SocketQueryParam('accessToken') accessToken: string,
        @SocketIO() io: Server,
    ) {
        const user = await this.authService.authenticate(accessToken);
        if (isError(user)) return user;
        io.of(`chat/${lobbyId}`).emit(ioEvent('chat.messages.broadcast.typing'), { author: user });
    }

    @OnMessage(ioEvent('chat.messages.new'))
    async sendMessage(
        @ConnectedSocket() socket: Socket,
        @NspParam('lobbyId') lobbyId: string,
        @SocketQueryParam('accessToken') accessToken: string,
        @MessageBody() body: MessageSchema,
        @SocketIO() io: Server,
    ) {
        const user = await this.authService.authenticate(accessToken);
        if (isError(user)) return user;

        const message = await this.chatService.sendMessage({
            content: body.content,
            lobbyId,
            userId: user.id,
        });

        if (isError(message)) {
            return socket.emit(ioEvent('user.error'), message);
        }

        io.of(`/chat/${lobbyId}`).emit(ioEvent('chat.messages.broadcast.new'), message);
    }
}

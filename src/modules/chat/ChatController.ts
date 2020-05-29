import { IsDefined, IsOptional, IsString } from 'class-validator';
import { CurrentUser, Get, JsonController, QueryParams } from 'routing-controllers';
import { ChatService } from 'src/modules/chat/ChatService';
import { BaseUser } from 'src/types/common';

class GetMessagesSchema {
    @IsDefined()
    @IsString()
    lobby_id!: string;

    @IsOptional()
    @IsString()
    page?: string;
}

@JsonController('/chat')
export class ChatController {
    constructor(private chatService: ChatService) {}

    @Get('/messages')
    async getMessages(@CurrentUser() user: BaseUser, @QueryParams() queries: GetMessagesSchema) {
        return this.chatService.getMessages({
            lobbyId: queries.lobby_id,
            page: Number(queries.page ?? 0),
            userId: user.id,
        });
    }
}

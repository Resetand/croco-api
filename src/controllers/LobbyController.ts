import { JsonController, Post, Body, Get, Param, CurrentUser } from 'routing-controllers';
import { LobbyService } from 'src/services/LobbyService';
import { IsOptional, IsString } from 'class-validator';
import { BaseUser } from 'src/types/common';

class CreateLobbySchema {
    @IsOptional()
    @IsString()
    name?: string;
}

@JsonController('/lobbies')
export class LobbyController {
    constructor(private lobbyService: LobbyService) {}

    @Post('/')
    createLobby(@Body() body: CreateLobbySchema) {
        return this.lobbyService.createLobby(body);
    }

    @Get('/')
    getLobbies() {
        return this.lobbyService.getLobbies();
    }

    @Post('/:anyLobbyId/token')
    getSessionToken(@Param('anyLobbyId') anyLobbyId: string, @CurrentUser() user: BaseUser) {
        return this.lobbyService.connectToLobby({ anyLobbyId, userId: user.id });
    }
}

import { IsOptional, IsString } from 'class-validator';
import { Body, Get, JsonController, Post } from 'routing-controllers';
import { LobbyService } from 'src/modules/lobby/LobbyService';

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
}

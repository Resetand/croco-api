import { JsonController, Post, CurrentUser, Get, Param } from 'routing-controllers';
import { MediaServerService } from 'src/services/MediaService';
import { AppUser } from 'src/types/common';
import { IsDefined } from 'class-validator';

class CreateBody {
    @IsDefined()
    name!: string;
}

@JsonController('/media')
export class MediaController {
    constructor(private mediaServerService: MediaServerService) {}

    @Post('/rooms')
    public createRoom(@Post() { name }: CreateBody) {
        return this.mediaServerService.createRoom({ name });
    }

    @Post('/rooms/:roomId/connect')
    public connect(@Param('roomId') roomId: string, @CurrentUser() user: AppUser) {
        return this.mediaServerService.connectToRoom({ roomId, userId: user.id });
    }
    @Post('/rooms/:roomId/disconnect')
    public disconnect(@Param('roomId') roomId: string, @CurrentUser() user: AppUser) {
        return this.mediaServerService.disconnect({ roomId, userId: user.id });
    }

    @Get('/rooms')
    public getActiveRooms() {
        // return this.mediaServerService.
    }
}

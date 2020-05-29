import { BaseEntity } from 'src/entities/BaseEntity';
import { Entity, PrimaryColumn } from 'typeorm';

@Entity('lobby_users')
export class LobbyUserEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    lobbyId!: string;

    @PrimaryColumn('uuid')
    userId!: string;
}

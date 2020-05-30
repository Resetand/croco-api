import { BaseEntity } from 'src/entities/BaseEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('game_sessions')
export class GameSessionEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('uuid')
    lobbyId!: string;

    @Column('uuid')
    termId!: string;

    @Column('timestamp')
    deadlineAt!: Date;

    @Column('uuid')
    playerId!: string;
}

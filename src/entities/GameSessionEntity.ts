import { BaseEntity } from 'src/entities/BaseEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('game_sessions')
export class GameSessionEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('uuid')
    termId!: string;

    @Column('timestamp')
    startAt!: Date;

    @Column('int')
    duration!: number;

    @Column('uuid')
    playerId!: string;

    // @ManyToOne(() => UserEntity)
    // @JoinColumn({ referencedColumnName: 'id' })
    // player: UserEntity;
}

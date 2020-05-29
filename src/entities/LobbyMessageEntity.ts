import { BaseEntity } from 'src/entities/BaseEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('lobby_messages')
export class LobbyMessageEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('text')
    content!: string;

    @Column('uuid')
    userId!: string;

    // @ManyToOne(() => UserEntity)
    // @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
    // user: UserEntity;

    @Column('uuid')
    lobbyId!: string;

    // @ManyToOne(() => LobbyEntity)
    // @JoinColumn()
    // lobby: LobbyEntity;
}

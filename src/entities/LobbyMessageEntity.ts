import { BaseEntity } from 'src/entities/BaseEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('lobby_messages')
export class LobbyMessageEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('text')
    text!: string;

    @Column('uuid')
    userId!: string;
}

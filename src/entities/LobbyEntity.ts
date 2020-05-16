import { BaseEntity } from 'src/entities/BaseEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('lobbies')
export class LobbyEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @PrimaryColumn('text')
    hrId!: string;

    @Column('text')
    name!: string;
}

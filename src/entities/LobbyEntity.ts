import { BaseEntity } from 'src/entities/BaseEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('lobbies')
export class LobbyEntity extends BaseEntity {
    @PrimaryColumn('text')
    id!: string;

    @Column('text')
    name!: string;
}

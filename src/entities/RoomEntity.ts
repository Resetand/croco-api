import { Column, PrimaryColumn, Entity } from 'typeorm';
import { BaseEntity } from 'src/entities/BaseEntity';

@Entity('rooms')
export class RoomEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('text')
    name!: string;
}

import { BaseEntity } from 'src/entities/BaseEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('terms')
export class TermEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('text')
    content!: string;

    @Column('uuid')
    categoryId: string;
}

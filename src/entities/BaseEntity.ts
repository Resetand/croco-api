import { Column } from 'typeorm';

export abstract class BaseEntity {
    @Column('timestamp')
    createdAt!: Date;

    @Column('timestamp')
    updatedAt!: Date;
}

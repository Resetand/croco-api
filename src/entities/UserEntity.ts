import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export type User = {
    login: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
};

@Entity()
export class UserEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column('text')
    login: string;

    @Column('text')
    email: string;

    @Column('text')
    password: string;
}

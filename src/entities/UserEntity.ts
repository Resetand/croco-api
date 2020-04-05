import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export type User = {
    username: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
};

@Entity('users')
export class UserEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column('text')
    username: string;

    @Column('text')
    email: string;

    @Column('text')
    password: string;
}

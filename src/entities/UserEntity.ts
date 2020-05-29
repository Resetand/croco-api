import { Column, Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { GameSessionEntity } from 'src/entities/GameSessionEntity';

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
    id!: string;

    // @ManyToOne(() => GameSessionEntity)
    // gameSessions!: GameSessionEntity[];

    @Column('text')
    username!: string;

    @Column('text')
    email!: string;

    @Column('text')
    password!: string;

    @Column('text')
    resetPasswordToken?: string | null;

    @Column('timestamp')
    resetPasswordExpires?: Date | null;
}

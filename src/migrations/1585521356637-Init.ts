import { MigrationInterface, QueryRunner } from 'typeorm';
import { makeTypeOrmSql, SqlQuery } from 'src/utils/migrations';
import { config } from 'src/config';
import bcrypt from 'bcrypt';

export class Init1585521356637 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = makeTypeOrmSql(queryRunner);

        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        await this.createUser(sql);
        await this.createLobby(sql);
    }

    public async createLobby(sql: SqlQuery) {
        await sql`CREATE TABLE IF NOT EXISTS lobbies (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
            , hr_id text NOT NULL UNIQUE 
            , name text
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
        )`;
    }

    public async createUser(sql: SqlQuery) {
        await sql`CREATE TABLE IF NOT EXISTS users (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
            , username TEXT NOT NULL UNIQUE
            , email TEXT NOT NULL UNIQUE
            , password TEXT NOT NULL
            , reset_password_token TEXT
            , reset_password_expires timestamptz
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
        )`;

        await sql`CREATE INDEX IF NOT EXISTS username_idx ON users(username)`;

        await sql`INSERT INTO users (id, username, email, password) values (
            ${config.robot.id}, ${'robot'}, ${config.robot.email}, ${bcrypt.hashSync(config.robot.password, 10)}
        )`;
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = makeTypeOrmSql(queryRunner);

        await sql`DROP TABLE IF EXISTS users`;
        await sql`DROP TABLE IF EXISTS lobbies`;
        await sql`DROP TABLE IF EXISTS lobby_connections`;
    }
}

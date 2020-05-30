import { MigrationInterface, QueryRunner } from 'typeorm';
import { makeTypeOrmSql, SqlQuery } from 'src/utils/migrations';
import { config } from 'src/config';
import bcrypt from 'bcrypt';

export class Init1585521356637 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = makeTypeOrmSql(queryRunner);

        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        await this.handleUser(sql);
        await this.handleTerms(sql);
        await this.handleLobby(sql);
        await this.handleGame(sql);
    }

    public async handleGame(sql: SqlQuery) {
        await sql`CREATE TABLE IF NOT EXISTS game_sessions (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
            , term_id uuid NOT NULL REFERENCES terms(id) 
            , player_id uuid NOT NULL REFERENCES users(id) 
            , lobby_id text NULL REFERENCES lobbies(id) 
            , deadline_at timestamptz NOT NULL
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
        )`;
    }

    public async handleTerms(sql: SqlQuery) {
        await sql`CREATE TABLE IF NOT EXISTS term_categories (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
            , locale text NOT NULL
            , name text NOT NULL
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
        )`;
        await sql`CREATE TABLE IF NOT EXISTS terms (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
            , content text
            , category_id uuid NOT NULL REFERENCES term_categories(id)
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
        )`;
    }

    public async handleLobby(sql: SqlQuery) {
        await sql`CREATE TABLE IF NOT EXISTS lobbies (
            id text NOT NULL PRIMARY KEY  
            , name text 
            , terms_category_id uuid NULL REFERENCES term_categories(id)
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
        )`;

        // await sql`CREATE INDEX IF NOT EXISTS lobbies_hr_id_indx ON lobbies(hr_id)`;

        await sql`CREATE TABLE IF NOT EXISTS lobby_users (
            lobby_id text NOT NULL REFERENCES lobbies(id)
            , user_id uuid NOT NULL REFERENCES users(id)
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
            , PRIMARY KEY(lobby_id,  user_id)
        )`;

        await sql`CREATE INDEX IF NOT EXISTS lobby_users_lobby_id_indx ON lobby_users(lobby_id)`;
        await sql`CREATE INDEX IF NOT EXISTS lobby_users_user_id_indx ON lobby_users(user_id)`;

        await sql`CREATE TABLE IF NOT EXISTS lobby_messages (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
            , content text NOT NULL 
            , user_id uuid NOT NULL REFERENCES users(id)
            , lobby_id text NOT NULL REFERENCES lobbies(id)
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
            )
        `;

        await sql`CREATE INDEX IF NOT EXISTS lobby_messages_lobby_id_indx ON lobby_messages(lobby_id)`;
        await sql`CREATE INDEX IF NOT EXISTS lobby_messages_user_id_indx ON lobby_messages(user_id)`;
    }

    public async handleUser(sql: SqlQuery) {
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
        await sql`DROP TABLE IF EXISTS term_categories`;
        await sql`DROP TABLE IF EXISTS terms`;
        await sql`DROP TABLE IF EXISTS lobbies`;
        await sql`DROP TABLE IF EXISTS lobby_users`;
        await sql`DROP TABLE IF EXISTS lobby_messages`;
    }
}

import { MigrationInterface, QueryRunner } from 'typeorm';
import { makeTypeOrmSql } from 'src/utils/migrations';

export class Init1585521356637 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = makeTypeOrmSql(queryRunner);

        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        await sql`CREATE TABLE IF NOT EXISTS users (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
            , login text NOT NULL
            , password text NOT NULL
            , email TEXT NOT NULL
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
        )`;

        await sql`CREATE INDEX IF NOT EXISTS login_idx ON users(login)`;
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = makeTypeOrmSql(queryRunner);

        await sql`DROP TABLE IF EXISTS users`;
    }
}

import { ApiEnv } from 'src/config';
require('dotenv').config();

export const defaultConfig = {
    port: 4001,
    env: process.env.NODE_ENV as ApiEnv,
    auth: {
        jwtSecret: process.env.JWT_SECRET!,
    },
    db: {
        type: 'postgres' as const,
        port: 5433,
        host: 'localhost',
        username: 'habits',
        password: 'habits',
        database: 'habits_db',
        schema: 'public',
        entities: ['src/entities/**/*.ts'],
        migrations: ['src/migrations/**/*.ts'],
        cli: {
            entitiesDir: 'src/entities',
            migrationsDir: 'src/migrations',
        },
    },
};

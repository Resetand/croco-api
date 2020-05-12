import { ApiEnv } from 'src/config';

require('dotenv').config();

export const defaultConfig = {
    port: 4001,
    env: process.env.NODE_ENV as ApiEnv,
    webApp: {
        url: 'http://localhost:3000',
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET!,
    },
    db: {
        type: 'postgres' as const,
        port: 5433,
        username: 'croco',
        password: 'croco',
        database: 'croco_db',
        schema: 'public',
        entities: ['src/entities/**/*.ts'],
        migrations: ['src/migrations/**/*.ts'],
        cli: {
            entitiesDir: 'src/entities',
            migrationsDir: 'src/migrations',
        },
    },

    robot: {
        id: '0308075d-da46-4827-b7c8-8213f764d1a3',
        googleUsername: 'habits.robot',
        password: process.env.ROBOT_PASSWORD!,
        email: 'habits.robot@gmail.com',
    },

    mediaServer: {
        secret: process.env.OPENVIDU_SECRET!,
        url: `https://localhost:4443`,
    },
};

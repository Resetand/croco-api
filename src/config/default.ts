export const defaultConfig = {
    port: 4001,
    auth: {
        jwtSecret: '' || process.env.JWT_SECRET!,
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

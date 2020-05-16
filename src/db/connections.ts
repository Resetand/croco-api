import { Pool, Query } from 'pg';
import { config } from 'src/config';
import { logger } from 'src/utils/logger';
import { TypeOrmLogger } from 'src/utils/TypeOrmLogger';
import { createConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const createDbClientConnection = async () => {
    return createConnection({
        type: config.db.type,
        host: config.db.host,
        port: config.db.port,
        username: config.db.username,
        password: config.db.password,
        database: config.db.database,
        entities: config.db.entities,
        migrations: config.db.migrations,
        schema: config.db.schema,
        namingStrategy: new SnakeNamingStrategy(),
        logger: new TypeOrmLogger(logger),
        synchronize: false,
        migrationsRun: false,
    });
};

export const createPool = () => {
    const submit = Query.prototype.submit;
    Query.prototype.submit = function (...args) {
        const { text, values = [] } = (this as any) as { text: string; values: any[] };
        logger.info(text, ...values);
        submit.call(this, ...args);
    };

    const pool = new Pool({
        database: config.db.database,
        user: config.db.username,
        host: config.db.host,
        password: config.db.password,
        port: config.db.port,
        max: 64,
    });

    return pool;
};

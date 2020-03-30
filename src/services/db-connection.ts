import { config } from 'src/config';
import { getConnectionManager } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { logger } from 'src/utils/logger';
import { TypeOrmLogger } from 'src/utils/TypeOrmLogger';

const connectionManager = getConnectionManager();

export const connection = connectionManager.create({
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
});

export const createConnection = async () => {
    await connection.connect().catch((e) => {
        logger.info('db connection error', e);
        process.exit(0);
    });
    return connection;
};

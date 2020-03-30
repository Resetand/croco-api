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
    });
};

import { Logger, QueryRunner } from 'typeorm';
import { logger } from 'src/utils/logger';

export class TypeOrmLogger implements Logger {
    logQuery(query: string, parameters?: unknown[] | undefined, queryRunner?: QueryRunner) {
        logger.info(`Query ${query}`, parameters, `name=${queryRunner?.connection.name}`);
    }
    logQueryError(error: string, query: string, parameters?: unknown[] | undefined, queryRunner?: QueryRunner) {
        logger.error(error, `QueryError ${query}`, parameters, `name=${queryRunner?.connection.name}`);
    }
    logQuerySlow(time: number, query: string, parameters?: unknown[] | undefined, queryRunner?: QueryRunner) {
        logger.warn(`QuerySlow`, time, query, parameters, `name=${queryRunner?.connection.name}`);
    }
    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        logger.info(message, `name=${queryRunner?.connection.name}`);
    }
    logMigration(message: string, queryRunner?: QueryRunner) {
        logger.info('Migration asd', message, `name=${queryRunner?.connection.name}`);
    }
    log(level: 'log' | 'info' | 'warn', message: unknown, queryRunner?: QueryRunner) {
        logger[level](`Migration ${message}`, message, `name=${queryRunner?.connection.name}`);
    }
}

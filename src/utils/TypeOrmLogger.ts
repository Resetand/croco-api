import { Logger, QueryRunner } from 'typeorm';
import { Logger as PinoLogger } from 'pino';

export class TypeOrmLogger implements Logger {
    constructor(private logger: PinoLogger) {}

    logQuery(query: string, parameters?: unknown[] | undefined, queryRunner?: QueryRunner) {
        this.logger.info(`Query`, query, parameters, `name=${queryRunner?.connection.name}`);
    }
    logQueryError(error: string, query: string, parameters?: unknown[] | undefined, queryRunner?: QueryRunner) {
        this.logger.error(error, `QueryError`, query, parameters, `name=${queryRunner?.connection.name}`);
    }
    logQuerySlow(time: number, query: string, parameters?: unknown[] | undefined, queryRunner?: QueryRunner) {
        this.logger.warn(`QuerySlow`, time, query, parameters, `name=${queryRunner?.connection.name}`);
    }
    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        this.logger.info(message, `name=${queryRunner?.connection.name}`);
    }
    logMigration(message: string, queryRunner?: QueryRunner) {
        this.logger.info('Migration', message, `name=${queryRunner?.connection.name}`);
    }
    log(level: 'log' | 'info' | 'warn', message: unknown, queryRunner?: QueryRunner) {
        this.logger[level]('Migration', message, `name=${queryRunner?.connection.name}`);
    }
}

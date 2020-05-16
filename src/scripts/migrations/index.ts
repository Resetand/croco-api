import { createDbClientConnection } from '../../db/connections';
import { Logger } from 'pino';
import { Connection, Migration } from 'typeorm';
import { makeTypeOrmSql } from '../../utils/migrations';

const PG_MIGRATE_LOCK_ID = 27031991;

export const commands = ['show', 'up', 'down'] as const;
export type CommandType = typeof commands[number];

const withAdvisoryLock = async (
    connection: Connection,
    fn: (connection: Connection) => Promise<Migration[] | void>,
): Promise<void> => {
    await connection.transaction(async ({ connection: con, queryRunner }) => {
        const sql = makeTypeOrmSql(queryRunner!);
        const {
            0: { lock_obtained },
        } = await sql`select pg_try_advisory_xact_lock(${PG_MIGRATE_LOCK_ID}) as "lock_obtained"`;
        if (lock_obtained) {
            await fn(con);
        } else {
            throw new Error(
                `"advisory_xact_lock" could not be obtained(${PG_MIGRATE_LOCK_ID}), another migration in progress`,
            );
        }
    });
};

export async function runMigrations(command: CommandType, logger: Logger) {
    let connection: Connection | undefined = undefined;
    try {
        connection = await createDbClientConnection();

        if (command === 'up') {
            logger.info('up migrations');
            await withAdvisoryLock(connection, (con) => con.runMigrations({ transaction: 'none' }));
        } else if (command === 'down') {
            logger.info('down migrations');
            await withAdvisoryLock(connection, (con) => con.undoLastMigration({ transaction: 'none' }));
        } else {
            await connection.showMigrations();
        }
    } catch (e) {
        logger.fatal(e);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

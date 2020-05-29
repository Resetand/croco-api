import { makeTypeOrmSql, SqlQuery } from 'src/utils/migrations';
import { Connection, EntityManager } from 'typeorm';

export type Transaction = { manager: EntityManager; sql: SqlQuery };
export class DbClient {
    constructor(private connection: Connection) {}

    public transaction = <T>(cb: (t: Transaction) => Promise<T>) => {
        return this.connection.transaction(async (manager) => {
            manager.connection;
            const sql = makeTypeOrmSql(manager.queryRunner!);
            return cb({ sql, manager });
        });
    };
}

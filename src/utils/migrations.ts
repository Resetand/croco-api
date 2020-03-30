import { prepareSql } from './sql';
import { QueryRunner } from 'typeorm';

export type QueryResult<T = unknown> = Record<number, T>;
export type SqlQuery = <T = QueryResult>(strings: TemplateStringsArray, ...vals: unknown[]) => Promise<T>;

export const makeTypeOrmSql = (queryRunner: QueryRunner): SqlQuery => {
    return <T = QueryResult>(strings: TemplateStringsArray, ...vals: unknown[]): Promise<T> => {
        const { query, values } = prepareSql(strings, ...vals);
        return queryRunner.query(query, values) as Promise<T>;
    };
};

export type RecursivePartial<T> = { [P in keyof T]?: T[P] extends Function ? T[P] : RecursivePartial<T[P]> };

export type JsonObject = { [x: string]: Json };
export type Json = string | number | boolean | null | JsonObject | Array<Json>;

export type ArgF<T, TKey extends keyof T> = T[TKey] extends (...args: infer P) => unknown ? P[0] : never;

export type NullableKeys<T> = {
    [K in keyof T]: null extends T[K] ? K : never;
}[keyof T];

export type NonNullableKeys<T> = {
    [K in keyof T]: null extends T[K] ? never : K;
}[keyof T];

export type OnlyNullableAsUndefined<T> = {
    [K in NullableKeys<T>]?: K extends keyof T ? T[K] : never;
};

export type PromiseValue<T> = T extends Promise<infer R> ? R : never;
export type AsyncMethodResult<T, K extends keyof T> = T[K] extends (...args: any) => any
    ? PromiseValue<ReturnType<T[K]>>
    : never;

export type Nullable<T> = {
    [K in keyof T]: T[K] | null;
};

export type ArrayItem<T extends Array<any>> = T extends Array<infer E> ? E : never;

export const errorCodes = [
    'NOT_FOUND',
    'BAD_REQUEST',
    'FORBIDDEN',
    'INVALID_OPERATION',
    'INTERNAL_ERROR',
    'UNAUTHORIZED',
    'TOO_MANY_REQUESTS',
    'EXPIRED',
    'UNKNOWN',
    'AGGREGATE_ERROR',
] as const;

export type ErrorCode = typeof errorCodes[number];

export type ResultError<T> = {
    __error: boolean;
    code: ErrorCode;
    statusCode: number;
    message: string;
    payload?: T;
};

export type Result<T, P = unknown> = T | ResultError<P>;
export type AsyncResult<T = unknown, P = unknown> = Promise<Result<T, P>>;

export const ifSuccess = <T, P, R>(map: (res: T) => R | Promise<R>) => {
    return (res: Result<T, P>) => {
        if (isSuccess(res)) {
            return map(res);
        }

        return res;
    };
};

export const resultAll = async <R extends AsyncResult<any>[]>(
    ...args: R
): AsyncResult<
    { [K in keyof R]: R[K] extends AsyncResult<infer R> ? R : never },
    { [K in keyof R]: R[K] extends AsyncResult<infer R, infer E> ? R | E : never }
> => {
    const results = await Promise.all(args);
    if (results.every(isSuccess)) {
        return results as any;
    }

    return error('AGGREGATE_ERROR', 'Произошла ошибка', 500, results) as any;
};

export const throwIfError = <T, P>(res: Result<T, P>): T => {
    if (isError(res)) {
        throw new ErrorResultError(res);
    }

    return res;
};

export const resultFromPromise = async <T>(
    promise: Promise<T>,
    errorCode: ErrorCode = 'INTERNAL_ERROR',
): AsyncResult<T> => {
    try {
        return await promise;
    } catch (e) {
        return error(errorCode, e.message, 400);
    }
};

export const isError = <T, P>(result: Result<T, P>): result is ResultError<P> => {
    return typeof result === 'object' && result !== null && '__error' in result;
};

// unfortunately don't work with generic type narrowing
export const assertSuccess = <T, P>(result: T | ResultError<P>): asserts result is T => {
    if (isError(result)) {
        throw new ErrorResultError(result);
    }
};

export class ErrorResultError extends Error {
    public constructor(result: ResultError<any>) {
        super(JSON.stringify(result, null, 2));
    }
}

export const isSuccess = <T, P>(result: T | ResultError<P>): result is T => !isError(result);

const createFactory = <T extends ErrorCode>(code: T, statusCode: number) => <P>(message: string, payload?: P) => ({
    __error: true,
    code,
    message,
    statusCode,
    payload,
});

export const notFound = createFactory('NOT_FOUND', 400);
export const badRequest = createFactory('BAD_REQUEST', 400);
export const missingRequiredFields = (...fields: string[]) =>
    badRequest(`Отсутствуют обязательные поля: [${fields.join(', ')}]`);

// fix 401 -> 400
// export const forbidden = createFactory('FORBIDDEN', 400);
export const forbidden = createFactory('FORBIDDEN', 401);

export const tooManyRequests = createFactory('TOO_MANY_REQUESTS', 400);
export const expired = createFactory('EXPIRED', 400);
export const unauthorized = createFactory('UNAUTHORIZED', 401);
export const invalidOperation = createFactory('INVALID_OPERATION', 400);
export const internalError = createFactory('INTERNAL_ERROR', 500);
export const okResult: Result<OkResult> = { ok: true };
export type OkResult = { ok: true };

export const error = <P>(code: ErrorCode, message: string, httpStatusCode: number, payload?: P): ResultError<P> => ({
    __error: true,
    code,
    message,
    statusCode: httpStatusCode,
    payload,
});

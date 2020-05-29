import { NextFunction, Request, Response } from 'express';
import { serializeError } from 'serialize-error';
import { isError } from '../utils/result';

const wellKnownErrors = [
    'HttpError',
    'BadRequestError',
    'ForbiddenError',
    'InternalServerError',
    'MethodNotAllowedError',
    'NotAcceptableError',
    'NotFoundError',
];

export const createErrorMiddleware = () => {
    return (e: Error, req: Request, res: Response, next: NextFunction) => {
        if (isError(e)) {
            if (e.code === 'UNAUTHORIZED') {
                return res.status(401).send(e);
            }
            return res.status(200).send(e);
        }

        if (wellKnownErrors.includes(e.name)) {
            return res.status(200).send(serializeError(e));
        }

        next(e);
    };
};

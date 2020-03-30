import { NextFunction, Request, Response } from 'express';
import { serializeError } from 'serialize-error';
import { forbidden, unauthorized } from '../utils/result';

const wellKnownErrors = [
    'HttpError',
    'BadRequestError',
    'ForbiddenError',
    'InternalServerError',
    'MethodNotAllowedError',
    'NotAcceptableError',
    'NotFoundError',
    'UnauthorizedError',
];

export const createErrorMiddleware = () => {
    return (e: Error, req: Request, res: Response, next: NextFunction) => {
        if (e.name === 'InvalidAccessToken') {
            const body = unauthorized('Token invalid or expired');
            res.status(body.statusCode).send(body);
            console.info(`[${body.statusCode}] ${req.url}`, body);
            return;
        }

        if (e.name === 'AccessDeniedError') {
            const body = forbidden('Не достаточно прав для совершения операции');
            res.status(body.statusCode).send(body);
            console.info(`[${body.statusCode}] ${req.url}`, body);
            return;
        }

        console.error(e);

        if (wellKnownErrors.includes(e.name)) {
            res.status(400).send(serializeError(e));
            return;
        }

        next(e);
    };
};

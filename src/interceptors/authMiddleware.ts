import { NextFunction, Request, Response } from 'express';
import jwt, { Algorithm } from 'jsonwebtoken';
import { config } from 'src/config';

class InvalidAccessToken extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidAccessToken';
    }
}

type JWTPayload = {
    iss: string;
    sub: string;
    email?: string;
    email_verified?: boolean;
    family_name?: string;
    given_name?: string;
    exp: number;
};

type DecodedToken = {
    header: {
        alg: Algorithm;
        kid: string;
    };
    payload: JWTPayload;
};

export const createAuth = () => {
    return async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { authorization } = request.headers;
            if (!authorization) {
                return next();
            }

            if (typeof authorization !== 'string') {
                next(new InvalidAccessToken('Authorization header is not correct'));
            }

            const [, token] = authorization.split(' ');
            let decoded: DecodedToken;
            try {
                decoded = jwt.decode(token, { complete: true }) as DecodedToken;
            } catch (error) {
                return next(new InvalidAccessToken(error.message));
            }

            const { payload } = decoded;

            if (!payload || !payload.sub || typeof payload.sub !== 'string') {
                return next(new InvalidAccessToken('Invalid access token payload'));
            }

            try {
                jwt.verify(token, config.auth.jwtSecret);
            } catch (error) {
                return next(new InvalidAccessToken(error.message));
            }

            response.locals.userId = payload.sub;
            next();
        } catch (e) {
            return next(e);
        }
    };
};

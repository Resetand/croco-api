import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware as HttpMiddleware } from 'routing-controllers';
import { Middleware as IOMiddleware, MiddlewareInterface as IOMiddlewareInterface } from 'socket-controllers';
import { Socket } from 'socket.io';
import { AuthService } from 'src/modules/auth/AuthService';
import { isError, unauthorized } from 'src/utils/result';
import { Inject } from 'typedi';

@IOMiddleware()
export class IoAuthMiddleware implements IOMiddlewareInterface {
    constructor(@Inject(() => AuthService) private authService: AuthService) {}

    async use(socket: Socket, next: (err?: any) => any) {
        const token = socket.handshake.query.accessToken;

        if (typeof token !== 'string') {
            return next(unauthorized('invalid access token'));
        }

        const result = await this.authService.authenticate(token);

        if (isError(result)) {
            return next(result);
        }
        (socket as any).user = result;

        socket.id = result.id;

        next();
    }
}

@HttpMiddleware({ type: 'before' })
export class AuthMiddleware implements ExpressMiddlewareInterface {
    constructor(@Inject(() => AuthService) private authService: AuthService) {}

    async use(request: Request, response: Response, next: NextFunction) {
        const { authorization } = request.headers;

        if (!authorization) {
            return next();
        }

        if (typeof authorization !== 'string') {
            return next(unauthorized('invalid token'));
        }
        const [, token] = authorization.split(' ');

        const result = await this.authService.authenticate(token);

        if (isError(result)) {
            return next(result);
        }
        response.locals.user = result;
        next();
    }
}

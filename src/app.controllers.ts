import { Express, Response } from 'express';
import { Action, useExpressServer } from 'routing-controllers';
import { AuthController } from './controllers/AuthController';

// add new controller here
const controllers = [AuthController];

type AppUser = {
    id: string;
    login?: string;
};

export const useControllers = (app: Express) => {
    useExpressServer(app, {
        routePrefix: '/api',
        controllers,
        defaultErrorHandler: false,
        cors: true,
        currentUserChecker: (action: Action) => {
            const response: Response = action.response;
            return response.locals?.user;
        },
        authorizationChecker: async (action: Action) => {
            const response: Response = action.response;
            const user = response.locals.user as AppUser | undefined;
            if (!user) {
                return false;
            }
            return true;
        },
    });
};

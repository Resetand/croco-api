import { Express, Response } from 'express';
import { Action, useExpressServer } from 'routing-controllers';
import { AuthController } from './controllers/AuthController';
import { AppUser } from 'src/types/common';
import { UserController } from 'src/controllers/UserController';
import { MediaController } from 'src/controllers/MediaController';

// add new controller here
const controllers = [AuthController, UserController, MediaController];

export const useControllers = (app: Express) => {
    useExpressServer(app, {
        routePrefix: '/api',
        controllers,
        defaultErrorHandler: false,
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

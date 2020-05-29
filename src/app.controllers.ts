import { Express, Response } from 'express';
import 'reflect-metadata'; // this shim is required
import { Action, useExpressServer } from 'routing-controllers';
import { useSocketServer } from 'socket-controllers';
import { Server } from 'socket.io';
import { IoAuthMiddleware, AuthMiddleware } from 'src/middlewares/AuthMiddleware';
import { IoLobbyController } from 'src/modules/lobby/IoLobbyController';
import { LobbyController } from 'src/modules/lobby/LobbyController';
import { UserController } from 'src/modules/user/UserController';
import { BaseUser } from 'src/types/common';
import { AuthController } from './modules/auth/AuthController';
import { ChatController } from 'src/modules/chat/ChatController';
import { IoChatController } from 'src/modules/chat/IoChatController';

// add new controller here
const httpControllers = [AuthController, UserController, LobbyController, ChatController];
const ioControllers = [IoLobbyController, IoChatController];

export const useControllers = (app: Express) => {
    useExpressServer(app, {
        routePrefix: '/api',
        controllers: httpControllers,
        defaultErrorHandler: false,
        middlewares: [AuthMiddleware],
        currentUserChecker: (action: Action) => {
            const response: Response = action.response;
            return response.locals?.user;
        },
        authorizationChecker: async (action: Action) => {
            const response: Response = action.response;
            const user = response.locals.user as BaseUser | undefined;
            if (!user) {
                return false;
            }
            return true;
        },
    });
};
export const useSockets = (io: Server) => {
    return useSocketServer(io, {
        useClassTransformer: true,
        controllers: ioControllers,
        middlewares: [IoAuthMiddleware],
    });
};

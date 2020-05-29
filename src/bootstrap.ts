import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import pinoExpress from 'express-pino-logger';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import 'reflect-metadata';
import { useContainer as useRoutingContainer } from 'routing-controllers';
import { useContainer as useSocketsContainer } from 'socket-controllers';
import createSocket from 'socket.io';
import { config } from 'src/config';
import { DbClient } from 'src/db/client';
import { createDbConnection } from 'src/db/connections';
import { Container } from 'typedi';
import { v4 } from 'uuid';
import { useControllers, useSockets } from './app.controllers';
import { createErrorMiddleware } from './middlewares/errorMiddleware';
import { logger } from './utils/logger';

export const bootstrapDi = async () => {
    const container = Container.of(v4());
    useRoutingContainer(container, { fallback: false, fallbackOnErrors: false });
    useSocketsContainer(container, { fallback: false, fallbackOnErrors: false });

    const connection = await createDbConnection();
    const dbClient = new DbClient(connection);

    container.set('connection', connection);
    container.set('dbClient', dbClient);

    return container;
};

export const bootstrapExpressApp = async () => {
    const app = express();

    app.use(cors());
    app.use(pinoExpress({ logger }));
    app.use(bodyParser.json());
    app.get('/ping', (_, res) => res.send('pong'));

    useControllers(app);

    app.use(createErrorMiddleware());

    return app;
};

export const bootstrapSockets = (server: HttpServer | HttpsServer) => {
    const socket = createSocket(server);

    useSockets(socket);
    logger.info('Socket enable', socket);
    return socket;
};

export const bootstrapServer = async () => {
    const container = await bootstrapDi();
    const app = await bootstrapExpressApp();

    const server = app.listen(config.port, () => logger.info(`Server started on port ${config.port}`));
    const socket = bootstrapSockets(server);
    container.set('socket', socket);
};

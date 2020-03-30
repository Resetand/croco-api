import bodyParser from 'body-parser';
import express from 'express';
import pinoExpress from 'express-pino-logger';
import 'reflect-metadata';
import { Container } from 'typedi';
import { useContainer as useTypeOrmContainer } from 'typeorm';
import { useContainer as useRoutingContainer } from 'routing-controllers';
import { useControllers } from './app.controllers';
import { createAuth } from './interceptors/authMiddleware';
import { createErrorMiddleware } from './interceptors/errorMiddleware';
import { createConnection } from './services/db-connection';
import { logger } from './utils/logger';
// import './services';

export const createApp = async () => {
    useTypeOrmContainer(Container);
    useRoutingContainer(Container, { fallback: false, fallbackOnErrors: false });

    await createConnection();

    const app = express();

    app.use(pinoExpress({ logger }));
    app.use(bodyParser.json());
    app.get('/ping', (_, res) => res.send('pong'));
    app.use(createAuth());

    useControllers(app);

    app.use(createErrorMiddleware());
    return app;
};

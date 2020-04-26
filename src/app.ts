import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import pinoExpress from 'express-pino-logger';
import 'reflect-metadata';
import { useContainer as useRoutingContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { useContainer as useTypeOrmContainer } from 'typeorm';
import { useControllers } from './app.controllers';
import { createAuth } from './interceptors/authMiddleware';
import { createErrorMiddleware } from './interceptors/errorMiddleware';
import { logger } from './utils/logger';

export const createApp = () => {
    useRoutingContainer(Container, { fallback: false, fallbackOnErrors: false });
    useTypeOrmContainer(Container, { fallback: false, fallbackOnErrors: false });

    const app = express();

    app.use(cors());
    app.use(pinoExpress({ logger }));
    app.use(bodyParser.json());
    app.get('/ping', (_, res) => res.send('pong'));

    app.use(createAuth());

    useControllers(app);

    app.use(createErrorMiddleware());

    return app;
};

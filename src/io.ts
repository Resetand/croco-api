import createSocket from 'socket.io';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { logger } from 'src/utils/logger';

export const bootstrapSockets = (server: HttpServer | HttpsServer) => {
    const socket = createSocket(server);
    logger.info('Socket enable', socket);
};

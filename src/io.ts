import createSocket from 'socket.io';
import { Server } from 'http';
import { logger } from 'src/utils/logger';

export const bootstrapSockets = (http: Server) => {
    const socket = createSocket(http);

    logger.info('Socket enable', socket);
};

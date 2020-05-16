import { createApp } from 'src/app';
import { config } from 'src/config';
import { createDbClientConnection } from 'src/db/connections';
import { bootstrapSockets } from 'src/io';
import { logger } from 'src/utils/logger';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const bootstrapServer = async () => {
    const app = createApp();
    await createDbClientConnection();
    const server = app.listen(config.port, () => logger.info(`Server started on port ${config.port}`));
    bootstrapSockets(server);
};

bootstrapServer().catch((e) => logger.fatal(e));

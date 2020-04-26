import { createApp } from 'src/app';
import { config } from 'src/config';
import { logger } from 'src/utils/logger';
import { bootstrapSockets } from 'src/io';
import { createDbClientConnection } from 'src/services/db-connection';

const bootstrapServer = async () => {
    const app = createApp();
    await createDbClientConnection();
    const http = app.listen(config.port, () => logger.info(`Server started on port ${config.port}`));
    bootstrapSockets(http);
};

bootstrapServer().catch((e) => {
    logger.fatal(e);
    process.exit(1);
});

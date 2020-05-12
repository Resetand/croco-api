import { createApp } from 'src/app';
import { config } from 'src/config';
import { logger } from 'src/utils/logger';
import { bootstrapSockets } from 'src/io';
import { createDbClientConnection } from 'src/services/db-connection';
import https from 'https';
import fs from 'fs';
import path from 'path';
import rootPath from 'app-root-path';

const bootstrapServer = async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const app = createApp();
    await createDbClientConnection();

    // const options: https.ServerOptions = {
    //     key: fs.readFileSync(path.resolve(rootPath.toString(), 'cert/openvidukey.pem')),
    //     cert: fs.readFileSync(path.resolve(rootPath.toString(), 'cert/openviducert.pem')),
    // };

    const server = app.listen(config.port, () => logger.info(`Server started on port ${config.port}`));
    // https.createServer(options, app).listen(config.port, () => logger.info(`https connections enable`));
    bootstrapSockets(server);
};

bootstrapServer().catch((e) => {
    logger.fatal(e);
    process.exit(1);
});

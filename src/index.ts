import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

createApp()
    .then((app) => app.listen(config.port, () => logger.info(`Server started on port ${config.port}`)))
    .catch((e) => logger.fatal(e));

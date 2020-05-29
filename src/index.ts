import { bootstrapServer } from 'src/bootstrap';
import { logger } from 'src/utils/logger';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

bootstrapServer().catch((e) => logger.fatal(e));

import { commands, CommandType, runMigrations } from '.';
import { logger } from '../../utils/logger';

if (commands.includes(process.argv[2] as CommandType)) {
    runMigrations(process.argv[2] as CommandType, logger).catch(logger.error);
} else {
    logger.fatal(`unknown command, use "npm run migration [${commands.join(', ')}]"`);
}

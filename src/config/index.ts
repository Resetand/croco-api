import { defaultConfig } from './default';
import { DeepPartial } from 'utility-types';

type ApiEnv = 'dev' | 'prod';
type Config = typeof defaultConfig;
export type OverwriteConfig = DeepPartial<Config>;

const env = (process.env.API_ENV as ApiEnv) || 'dev';

const configsMap: Record<ApiEnv, Config> = {
    dev: require('./default')?.default,
    prod: require('./prod')?.default,
};

export const config: Config = configsMap[env] || defaultConfig;

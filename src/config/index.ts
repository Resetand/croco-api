import { defaultConfig } from './default';
import { DeepPartial } from 'utility-types';

export type ApiEnv = 'dev' | 'prod';
export type Config = typeof defaultConfig;
export type OverwriteConfig = DeepPartial<Config>;

const env = (process.env.NODE_ENV as ApiEnv) || 'dev';

const configsMap: Record<ApiEnv, Config> = {
    dev: require('./default')?.default,
    prod: require('./prod')?.default,
};

export const config: Config = configsMap[env] || defaultConfig;

console.log(config);

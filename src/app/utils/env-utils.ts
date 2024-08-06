import logger from '../logger';

export const PORT: number = 3001;
export const HOST: string = `http://localhost:${PORT}`

const DEFAULT_CONFIGS = {
  database: ':memory:',
  username: 'sql-lite',
  synchronize: true
};
export const getDBConfigs = async () => {
  const { NODE_ENV } = process.env;
  try {
    if (!NODE_ENV || NODE_ENV === 'dev') {
      logger.info('Defaulting to local db configs');
      return DEFAULT_CONFIGS;
    }
    return _stubExternalSecretConfig(); //aws secrets or likewise service call
  } catch (e) {
    logger.error(`Error fetching configs: ${e.message}`);
    return DEFAULT_CONFIGS;
  }
};

const _stubExternalSecretConfig = () => {
  return Promise.resolve(DEFAULT_CONFIGS);
}
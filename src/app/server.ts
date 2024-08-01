import express, { Request, Response } from 'express';
import logger from './logger';
import routes from './routes';
const PORT: number = 3001;

const start = (): void => {
  logger.info(`starting application`);
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  app.listen(PORT, () => {
    logger.info(`app listening on port: ${PORT}`);
  });
}

start();
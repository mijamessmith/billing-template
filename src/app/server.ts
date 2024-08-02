import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import logger from './logger';
import routes from './routes';
const PORT: number = 3001;
const HOST: string = `http://localhost:${PORT}`

const start = (): void => {
  logger.info(`starting application`);
  const app = express();
  const swaggerDocument = JSON.parse(readFileSync(path.resolve(__dirname, '../../openapi.json'), 'utf8'));
  app.use(express.json());
  app.use('/api', routes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.listen(PORT, () => {
    logger.info(`app listening on port: ${PORT}`);
    logger.info(`API Documentation available at ${HOST}/api-docs`);
  });
}

start();
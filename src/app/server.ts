import 'reflect-metadata';
import express, { Request, Response } from 'express';
import DatabaseConnection from './datastore/database/datasource';
import { readFileSync } from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import logger from './logger';
import { HOST, PORT } from './utils/env-utils';
import routes from './routes';
import { authorize } from './libs/middleware';
const start = async ()  => {
  logger.info(`starting application in environment: ${process.env.NODE_ENV}`);
  process.on('uncaughtException', function (err, origin) {
    logger.error(`There was a fatal exception. cause: ${err}, origin: ${origin}`);
    setTimeout(function () {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`UnhandledPromiseRejection, cause: ${reason}`);
  });
  logger.info(`Connecting to DB Instance...`);
  const dbConnection = DatabaseConnection.getInstance();
  await dbConnection.getDataSource();
  logger.info(`Connected to DB`);
  const app = express();
  const swaggerDocument = JSON.parse(readFileSync(path.resolve(__dirname, '../../openapi.json'), 'utf8'));

  logger.info(`Applying middleware`);
  app.use(express.json());
  app.use(authorize);

  logger.info(`Initializing API`)
  app.use('/api', routes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.listen(PORT, () => {
    logger.info(`app listening on port: ${PORT}`);
    logger.info(`API Documentation available at ${HOST}/api-docs`);
  });
  return app;
}

const app = start();
export default app;
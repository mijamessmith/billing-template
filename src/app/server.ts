import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import logger from './logger';
import routes from './routes';
const PORT: number = 3001;
const HOST: string = `http://localhost:${PORT}`

const start = ()  => {
  logger.info(`starting application`);
  process.on('uncaughtException', function (err, origin) {
    logger.error(`There was a fatal exception. cause: ${err}, origin: ${origin}`);
    setTimeout(function () {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`UnhandledPromiseRejection, cause: ${reason}`);
  });
  const app = express();
  const swaggerDocument = JSON.parse(readFileSync(path.resolve(__dirname, '../../openapi.json'), 'utf8'));
  app.use(express.json());
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